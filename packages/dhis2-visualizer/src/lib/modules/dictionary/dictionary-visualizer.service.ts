import axios from 'axios';

export class MetadataService {
  /**
   * Fetch metadata by ID.
   * @param id The ID of the metadata to fetch.
   * @returns A Promise of the metadata.
   */
  async fetchMetadataById(id: string): Promise<any> {
    const apiUrl = '../../../api/';
    const headers = { headers: { 'Content-Type': 'text/plain' } };

    try {
      const identifiableResponse = await this.fetchIdentifiableObject(id);

      const href: string = identifiableResponse.data?.href || '';

      if (href.includes('indicators')) {
        return await this.fetchIndicatorMetadata(apiUrl, id, headers);
      } else if (href.includes('programIndicators')) {
        return await this.fetchProgramIndicatorMetadata(apiUrl, id, headers);
      } else if (href.includes('dataElements')) {
        return await this.fetchDataElementMetadata(apiUrl, id);
      } else {
        throw new Error(`Unsupported type in href: ${href}`);
      }
    } catch (error: any) {
      throw new Error(`Error fetching metadata: ${error.message}`);
    }
  }

  async fetchIdentifiableObject(id: string) {
    return axios.get(`../../../api/identifiableObjects/${id}`);
  }

  private async fetchIndicatorMetadata(
    apiUrl: string,
    id: string,
    headers: any
  ) {
    const indicatorsResponse = await this.fetchIndicator(apiUrl, id);
    const indicatorData = indicatorsResponse.data;

    const dataSetIdsFromNumerator = this.extractAllDataElementIds(
      indicatorData.numerator
    );
    const dataSetIdsFromDenominator = this.extractAllDataElementIds(
      indicatorData.denominator
    );
    const dataElementsFromIndicator = [
      ...dataSetIdsFromNumerator,
      ...dataSetIdsFromDenominator,
    ];
    const progIndicatorInNumerator = this.extractProgramIndicators(
      indicatorData.numerator
    );
    const progIndicatorInDenominator = this.extractProgramIndicators(
      indicatorData.denominator
    );
    const programIndicators = [
      ...progIndicatorInDenominator,
      ...progIndicatorInNumerator,
    ];
    const dataSetIds = [
      ...(indicatorData.dataSets?.map((dataSet: { id: any }) => dataSet.id) ||
        []),
    ];

    const [
      numeratorResponse,
      denominatorResponse,
      dataSetIdSourcesFromNumerator,
      dataSetIdSourcesFromDenominator,
      programIndicatorsInIndicator,
      dataElementsInIndicator,
      dataSetsInIndicator,
    ] = await Promise.all([
      this.fetchNumeratorDescription(apiUrl, indicatorData.numerator, headers),
      this.fetchDenominatorDescription(
        apiUrl,
        indicatorData.denominator,
        headers
      ),
      this.fetchDataSetIdSources(apiUrl, dataSetIdsFromNumerator),
      this.fetchDataSetIdSources(apiUrl, dataSetIdsFromDenominator),
      this.fetchProgramIndicatorsInIndicator(apiUrl, programIndicators),
      this.fetchDataElementsInIndicator(apiUrl, dataElementsFromIndicator),
      this.fetchDataSetsInIndicator(apiUrl, dataSetIds),
    ]);

    const numeratorDescription = numeratorResponse.data.description;
    const denominatorDescription = denominatorResponse.data.description;
    const dataElements = dataElementsInIndicator.data.dataElements;

    return {
      ...indicatorData,
      numeratorExpressionMeaning: numeratorDescription,
      denominatorExpressionMeaning: denominatorDescription,
      dataElementsList: dataElements,
      dataElementsFromNumerator: dataSetIdsFromNumerator,
      dataElementsFromDenominator: dataSetIdsFromDenominator,
      programIndicatorsInIndicator:
        programIndicatorsInIndicator.data.programIndicators,
      dataSetsInIndicator: dataSetsInIndicator.data.dataSets,
    };
  }

  private async fetchIndicator(apiUrl: string, id: string) {
    return axios.get(
      `${apiUrl}indicators/${id}.json?fields=:all,user[name,email,phoneNumber],displayName,lastUpdatedBy[id,name,phoneNumber,email],id,name,numeratorDescription,denominatorDescription,denominator,numerator,annualized,decimals,indicatorType[name],user[name],userGroupAccesses[*],userAccesses[*],attributeValues[value,attribute[name]],indicatorGroups[id,name,code,indicators[id,name]]`
    );
  }

  private async fetchNumeratorDescription(
    apiUrl: string,
    numerator: string,
    headers: any
  ) {
    return axios.post(
      `${apiUrl}29/indicators/expression/description`,
      numerator,
      headers
    );
  }

  private async fetchDenominatorDescription(
    apiUrl: string,
    denominator: string,
    headers: any
  ) {
    return axios.post(
      `${apiUrl}29/indicators/expression/description`,
      denominator,
      headers
    );
  }

  private async fetchDataSetIdSources(apiUrl: string, dataSetIds: string[]) {
    return axios.get(
      `${apiUrl}dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&filter=dataSetElements.dataElement.id:in:[${dataSetIds}]&paging=false`
    );
  }

  private async fetchProgramIndicatorsInIndicator(
    apiUrl: string,
    programIndicators: string[]
  ) {
    return axios.get(
      `${apiUrl}programIndicators.json?filter=id:in:[${programIndicators}]&fields=*,programIndicatorGroups[id,name]`
    );
  }

  private async fetchDataElementsInIndicator(
    apiUrl: string,
    dataElementsFromIndicator: string[]
  ) {
    return axios.get(
      `${apiUrl}dataElements.json?filter=id:in:[${dataElementsFromIndicator}]&paging=false&fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name,dataElements~size]`
    );
  }

  private async fetchDataSetsInIndicator(apiUrl: string, dataSetIds: string[]) {
    return axios.get(
      `${apiUrl}dataSets.json?filter=id:in:[${dataSetIds}]&fields=*,organisationUnits[id,name],dataSetElements[dataElement[id,name]`
    );
  }

  private async fetchProgramIndicatorMetadata(
    apiUrl: string,
    id: string,
    headers: any
  ) {
    // Fetch program indicator first (needed for all other calls)
    const programIndicatorsResponse = await this.fetchProgramIndicator(
      apiUrl,
      id
    );
    const programIndicatorData = programIndicatorsResponse.data;

    // Parallelize calls that don't depend on each other
    const [
      expressionDescription,
      programIndicatorInNumerator,
      programIndicatorInDenominator,
      filterDescriptionResult,
    ] = await Promise.all([
      this.fetchProgramIndicatorExpressionDescription(
        apiUrl,
        programIndicatorData.expression,
        headers
      ),
      this.fetchProgramIndicatorInNumerator(apiUrl, programIndicatorData.id),
      this.fetchProgramIndicatorInDenominator(apiUrl, programIndicatorData.id),
      programIndicatorData.filter
        ? this.fetchProgramIndicatorFilterDescription(
            apiUrl,
            programIndicatorData.filter,
            headers
          )
        : Promise.resolve(null),
    ]);

    const programIndicatorFilter =
      programIndicatorData.filter !== undefined
        ? programIndicatorData.filter
        : '';
    const dataElementsFromFilter = this.extractDataElements(
      programIndicatorFilter
    );
    const dataElementsFromExpression = this.extractDataElements(
      programIndicatorData.expression
    );
    const dataElementsIds = [
      ...dataElementsFromExpression,
      ...dataElementsFromFilter,
    ];

    const dataElementsInPogramIndicator =
      await this.fetchDataElementsInProgramIndicator(apiUrl, dataElementsIds);

    return {
      ...programIndicatorData,
      programIndicatorExpression: expressionDescription.data.description,
      filterDescription: programIndicatorData.filter
        ? filterDescriptionResult.data.description
        : '',
      dataElementsInPogramIndicator:
        dataElementsInPogramIndicator.data.dataElements,
      indicatorsWithProgramIndicators: [
        ...programIndicatorInNumerator.data.indicators,
        ...programIndicatorInDenominator.data.indicators,
      ],
    };
  }

  private async fetchProgramIndicator(apiUrl: string, id: string) {
    return axios.get(
      `${apiUrl}programIndicators/${id}.json?fields=:all,id,name,shortName,lastUpdated,analyticsPeriodBoundaries,created,userGroupAccesses[*],userAccesses[*],aggregationType,expression,filter,expiryDays,user[id,name,phoneNumber],lastUpdatedBy[id,name,phoneNumber],createdBy[id,name],programIndicatorGroups[id,name,code,programIndicators[id,name]]`
    );
  }

  private async fetchProgramIndicatorExpressionDescription(
    apiUrl: string,
    expression: string,
    headers: any
  ) {
    return axios.post(
      `${apiUrl}29/programIndicators/expression/description`,
      expression,
      headers
    );
  }

  private async fetchProgramIndicatorFilterDescription(
    apiUrl: string,
    filter: string,
    headers: any
  ) {
    return axios.post(
      `${apiUrl}29/programIndicators/filter/description`,
      filter,
      headers
    );
  }

  private async fetchProgramIndicatorInNumerator(apiUrl: string, id: string) {
    return axios.get(
      `${apiUrl}indicators.json?filter=numerator:like:${id}&fields=name,numerator,denominator,description,indicatorType[name]`
    );
  }

  private async fetchProgramIndicatorInDenominator(apiUrl: string, id: string) {
    return axios.get(
      `${apiUrl}indicators.json?filter=denominator:like:${id}&fields=name,numerator,denominator,description,indicatorType[name]`
    );
  }

  private async fetchDataElementsInProgramIndicator(
    apiUrl: string,
    dataElementsIds: string[]
  ) {
    return axios.get(
      `${apiUrl}dataElements.json?filter=id:in:[${dataElementsIds}]&paging=false&fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name,dataElements~size]`
    );
  }

  private async fetchDataElementMetadata(apiUrl: string, id: string) {
    const [
      dataElementResponse,
      dataElementInNumerator,
      dataElementInDenominator,
    ] = await Promise.all([
      this.fetchDataElement(apiUrl, id),
      this.fetchDataElementInNumerator(apiUrl, id),
      this.fetchDataElementInDenominator(apiUrl, id),
    ]);

    return {
      ...dataElementResponse.data,
      indicators: [
        ...dataElementInNumerator.data.indicators,
        ...dataElementInDenominator.data.indicators,
      ],
      dataElementInNumeratorLength:
        dataElementInNumerator.data.indicators.length,
      dataElementInDenominatorLength:
        dataElementInDenominator.data.indicators.length,
    };
  }

  private async fetchDataElement(apiUrl: string, id: string) {
    return axios.get(
      `${apiUrl}dataElements/${id}.json?fields=:all,id,name,shortName,code,formName,description,created,lastUpdated,createdBy[id,name],lastUpdatedBy[id,name],valueType,aggregationType,domainType,zeroIsSignificant,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType,timelyDays]],programs[id,name],validationRulesMatchCount,indicatorNumeratorExpressionMatchCount,indicatorDenominatorExpressionMatchCount`
    );
  }

  private async fetchDataElementInNumerator(apiUrl: string, id: string) {
    return axios.get(
      `${apiUrl}indicators.json?filter=numerator:like:${id}&fields=name,numerator,denominator,description,indicatorType[name]`
    );
  }

  private async fetchDataElementInDenominator(apiUrl: string, id: string) {
    return axios.get(
      `${apiUrl}indicators.json?filter=denominator:like:${id}&fields=name,numerator,denominator,description,indicatorType[name]`
    );
  }

  extractAllDataElementIds(expression: string): string[] {
    const regex = /R{([\w\d]+)\./g;
    const matches = [...expression.matchAll(regex)];
    return matches.map((match) => match[1]);
  }

  regex = /#{[A-Za-z0-9]{11}\.([A-Za-z0-9]{11})}/g;

  extractDataElements(input: string): string[] {
    const matches = [...input.matchAll(this.regex)];
    return matches.map((match) => match[1]);
  }

  regexProgram = /I\{([A-Za-z0-9]{11})\}/g;

  extractProgramIndicators(input: string): string[] {
    const matches = [...input.matchAll(this.regexProgram)];
    return matches.map((match) => match[1]);
  }
}





  // private async fetchProgramIndicatorMetadata(
  //   apiUrl: string,
  //   id: string,
  //   headers: any
  // ) {
  //   const programIndicatorsResponse = await this.fetchProgramIndicator(
  //     apiUrl,
  //     id
  //   );
  //   const programIndicatorData = programIndicatorsResponse.data;

  //   const expressionDescription =
  //     await this.fetchProgramIndicatorExpressionDescription(
  //       apiUrl,
  //       programIndicatorData.expression,
  //       headers
  //     );
  //   let filterDescription: any;
  //   if (programIndicatorData.filter) {
  //     filterDescription = await this.fetchProgramIndicatorFilterDescription(
  //       apiUrl,
  //       programIndicatorData.filter,
  //       headers
  //     );
  //   }

  //   const programIndicatorInNumerator =
  //     await this.fetchProgramIndicatorInNumerator(
  //       apiUrl,
  //       programIndicatorData.id
  //     );
  //   const programIndicatorInDenominator =
  //     await this.fetchProgramIndicatorInDenominator(
  //       apiUrl,
  //       programIndicatorData.id
  //     );

  //   const programIndicatorFilter =
  //     programIndicatorData.filter !== undefined
  //       ? programIndicatorData.filter
  //       : '';
  //   const dataElementsFromFilter = this.extractDataElements(
  //     programIndicatorFilter
  //   );
  //   const dataElementsFromExpression = this.extractDataElements(
  //     programIndicatorData.expression
  //   );
  //   const dataElementsIds = [
  //     ...dataElementsFromExpression,
  //     ...dataElementsFromFilter,
  //   ];

  //   const dataElementsInPogramIndicator =
  //     await this.fetchDataElementsInProgramIndicator(apiUrl, dataElementsIds);

  //   return {
  //     ...programIndicatorData,
  //     programIndicatorExpression: expressionDescription.data.description,
  //     filterDescription: programIndicatorData.filter
  //       ? filterDescription.data.description
  //       : '',
  //     dataElementsInPogramIndicator:
  //       dataElementsInPogramIndicator.data.dataElements,
  //     indicatorsWithProgramIndicators: [
  //       ...programIndicatorInNumerator.data.indicators,
  //       ...programIndicatorInDenominator.data.indicators,
  //     ],
  //   };
  // }