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
      } else if (href.includes('dataSets')) {
        return await this.fetchDataSetMetadata(apiUrl, id);
      } else {
        throw new Error(`Unsupported type in href: ${href}`);
      }
    } catch (error: any) {
      throw new Error(`Error fetching metadata: ${error.message}`);
    }
  }

  async fetchFunctionWithRule(functionId: string, ruleId: string) {
    const apiUrl = '../../../api/';
    const functionResponse = await this.fetchFunction(functionId);
    const functionData = functionResponse.data;
    const rule = Array.isArray(functionData.rules)
      ? functionData.rules.find((r: any) => r.id === ruleId)
      : null;
    let referencedIds: string[] = [];
    if (rule.json.generator) {
      const expr = rule.json.generator.expression || '';
      referencedIds = Array.from(new Set(this.extractIdentifiers(expr)));
    }

    const referencedDetails = await Promise.all(
      referencedIds.map(async (refId) => {
        try {
          const identifiableResponse = await this.fetchIdentifiableObject(
            refId
          );
          const href: string = identifiableResponse.data?.href || '';

          if (href.includes('dataElements')) {
            const de = await this.fetchDataElement(apiUrl, refId);
            return { ...de.data };
          } else if (href.includes('indicators')) {
            const ind = await this.fetchIndicator(apiUrl, refId);
            return { ...ind.data };
          } else if (href.includes('programIndicators')) {
            const pi = await this.fetchProgramIndicator(apiUrl, refId);
            return { ...pi.data };
          } else {
            return { type: 'Unknown', id: refId };
          }
        } catch {
          return { type: 'Unknown', id: refId };
        }
      })
    );

    return {
      ...functionData,
      ruleID: ruleId,
      referencedDetails: referencedDetails,
    };
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
    // const dataElementIdsFromNumerator = this.extractDataElements(
    //   indicatorData.numerator
    // );
    // const dataElementIdsFromDenominator = this.extractDataElements(
    //   indicatorData.denominator
    // );
    const dataElementIdsFromNumerator = Array.from(
      new Set(this.extractDataElements(indicatorData.numerator))
    );
    const dataElementIdsFromDenominator = Array.from(
      new Set(this.extractDataElements(indicatorData.denominator))
    );

    // const dataElementsFromIndicator = Array.from(
    //   new Set([
    //     ...dataElementIdsFromNumerator,
    //     ...dataElementIdsFromDenominator,
    //   ])
    // );

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
    // const dataSetIds = [
    //   ...(indicatorData.dataSets?.map((dataSet: { id: any }) => dataSet.id) ||
    //     []),
    // ];
    const dataSetIds = Array.from(
      new Set([...dataSetIdsFromNumerator, ...dataSetIdsFromDenominator])
    );

    const [
      numeratorResponse,
      denominatorResponse,
      dataSetIdSourcesFromNumerator,
      dataSetIdSourcesFromDenominator,
      programIndicatorsInNumerator,
      programIndicatorsInDenomiator,
      dataElementsInNumerator,
      dataElementsInDenominator,
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
      this.fetchProgramIndicatorsInIndicator(apiUrl, progIndicatorInNumerator),
      this.fetchProgramIndicatorsInIndicator(apiUrl, progIndicatorInDenominator),
      this.fetchDataElementsInMetaData(apiUrl, dataElementIdsFromNumerator),
      this.fetchDataElementsInMetaData(apiUrl, dataElementIdsFromDenominator),
      this.fetchDataSetsInIndicator(apiUrl, dataSetIds),
    ]);

    const numeratorDescription = numeratorResponse.data.description;
    const denominatorDescription = denominatorResponse.data.description;
    const dataElements = [
      ...dataElementsInNumerator.data.dataElements,
      ...dataElementsInDenominator.data.dataElements,
    ];
    const programIndicatorsInIndicator = [
      ...programIndicatorsInNumerator.data.programIndicators,
      ...programIndicatorsInDenomiator.data.programIndicators,
    ];

    return {
      ...indicatorData,
      numeratorExpressionMeaning: numeratorDescription,
      denominatorExpressionMeaning: denominatorDescription,
      dataElementsList: dataElements,
      dataElementsFromNumerator: dataSetIdsFromNumerator,
      dataElementsFromDenominator: dataSetIdsFromDenominator,
      programIndicatorsInIndicator:
        programIndicatorsInIndicator,
      dataSetsInIndicator: dataSetsInIndicator.data.dataSets,
      dataElementNumeratorSource: dataElementsInNumerator.data.dataElements,
      dataElementDenominatorSource: dataElementsInDenominator.data.dataElements,
      programIndicatorNumeratorSource: programIndicatorsInNumerator.data.programIndicators,
      programIndicatorDenominatorSource: programIndicatorsInDenomiator.data.programIndicators,
    };
  }

  private async fetchProgramIndicatorMetadata(
    apiUrl: string,
    id: string,
    headers: any
  ) {
    const programIndicatorsResponse = await this.fetchProgramIndicator(
      apiUrl,
      id
    );
    const programIndicatorData = programIndicatorsResponse.data;

    const [
      expressionDescription,
      filterDescription,
      programIndicatorInNumerator,
      programIndicatorInDenominator,
    ] = await Promise.all([
      this.fetchProgramIndicatorExpressionDescription(
        apiUrl,
        programIndicatorData.expression,
        headers
      ),
      programIndicatorData.filter
        ? this.fetchProgramIndicatorFilterDescription(
            apiUrl,
            programIndicatorData.filter,
            headers
          )
        : Promise.resolve({ data: { description: '' } }),
      this.fetchProgramIndicatorInNumerator(apiUrl, programIndicatorData.id),
      this.fetchProgramIndicatorInDenominator(apiUrl, programIndicatorData.id),
    ]);

    const programIndicatorFilter =
      programIndicatorData.filter !== undefined
        ? programIndicatorData.filter
        : '';
    const dataElementsFromFilter = this.extractDataElementsFromFilter(
      programIndicatorFilter
    );
    const dataElementsFromExpression = this.extractDataElementsFromFilter(
      programIndicatorData.expression
    );
    const dataElementsIds = [
      ...dataElementsFromExpression,
      ...dataElementsFromFilter,
    ];

    const dataElementsInPogramIndicator =
      await this.fetchDataElementsInMetaData(apiUrl, dataElementsIds);

    return {
      ...programIndicatorData,
      programIndicatorExpression: expressionDescription.data.description,
      filterDescription: programIndicatorData.filter
        ? filterDescription.data.description
        : '',
      dataElementsInPogramIndicator:
        dataElementsInPogramIndicator.data.dataElements,
      indicatorsWithProgramIndicators: [
        ...programIndicatorInNumerator.data.indicators,
        ...programIndicatorInDenominator.data.indicators,
      ],
    };
  }

  private async fetchDataElementMetadata(apiUrl: string, id: string) {
    const [
      dataElementResponse,
      dataElementInNumerator,
      dataElementInDenominator,
      dataElementInValidationRule,
    ] = await Promise.all([
      this.fetchDataElement(apiUrl, id),
      this.fetchDataElementInNumerator(apiUrl, id),
      this.fetchDataElementInDenominator(apiUrl, id),
      this.fetchDataElementInValidationRule(apiUrl, id),
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
      dataElementInValidationRuleLength:
        dataElementInValidationRule.data.validationRules.length,
    };
  }

  private async fetchDataSetMetadata(apiUrl: string, id: string) {
    //og://:all,id,name,shortName,code,description,periodType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType],dataElement[id,name,aggregationType,valueType,zeroIsSignificant,categoryCombo[id,name],dataElementGroups[id,name]]],organisationUnits[id,name]
    //v1: `${apiUrl}dataSets/${id}.json?fields=id,name,created,lastUpdated,createdBy[id,displayName,name],lastUpdatedBy[id,displayName,name],formType,periodType,shortName,dimensionItemType,legendSets[id,name],timelyDays,expiryDays,validCompleteOnly,compulsoryFieldsCompleteOnly,compulsoryDataElementOperands[id,displayName,name],dataSetElements[dataSet[id,name,periodType],dataElement[id,name,aggregationType,valueType,zeroIsSignificant,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataElementGroups[id,name]]],categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]]`
    //v3:   `${apiUrl}dataSets/${id}.json?fields=id,name,created,lastUpdated,createdBy[id,displayName,name],lastUpdatedBy[id,displayName,name],formType,periodType,shortName,dimensionItemType,legendSets[id,name],timelyDays,expiryDays,validCompleteOnly,compulsoryFieldsCompleteOnly,compulsoryDataElementOperands[id,displayName,name],dataSetElements[dataSet[id,name,periodType],dataElement[id,name,aggregationType,valueType,zeroIsSignificant,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name]]],dataElementGroups[id,name]]],categoryCombo[id,name]`
    const dataSetResponse = await axios.get(
`${apiUrl}dataSets/${id}.json?fields=id,name,created,lastUpdated,createdBy[id,displayName,name],lastUpdatedBy[id,displayName,name],formType,periodType,shortName,dimensionItemType,legendSets[id,name],timelyDays,expiryDays,validCompleteOnly,compulsoryFieldsCompleteOnly,compulsoryDataElementOperands[id,displayName,name],dataSetElements[dataSet[id,name,periodType],dataElement[id,name,aggregationType,valueType,zeroIsSignificant,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataElementGroups[id,name]]],categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]]`
    );
    return {
      ...dataSetResponse.data,
    };
  }

  async fetchIdentifiableObject(id: string) {
    return axios.get(`../../../api/identifiableObjects/${id}`);
  }

  async fetchFunction(id: string) {
    return axios.get(`../../../api/dataStore/functions/${id}`);
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
      `${apiUrl}programIndicators.json?filter=id:in:[${programIndicators}]&fields=*,program[id,name],programIndicatorGroups[id,name]`
    );
  }

  private async fetchDataElementsInMetaData(
    apiUrl: string,
    dataElementsFromIndicator: string[]
  ) {
    return axios.get(
      `${apiUrl}dataElements.json?filter=id:in:[${dataElementsFromIndicator}]&paging=false&fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name]`
    );
  }

  private async fetchDataSetsInIndicator(apiUrl: string, dataSetIds: string[]) {
    return axios.get(
      `${apiUrl}dataSets.json?filter=id:in:[${dataSetIds}]&fields=:all,organisationUnits[id,name],dataSetElements[dataElement[id,name]`
    );
  }

  private async fetchProgramIndicator(apiUrl: string, id: string) {
    return axios.get(
      `${apiUrl}programIndicators/${id}.json?fields=:all,id,name,shortName,lastUpdated,program[id,name,programType],analyticsPeriodBoundaries,created,userGroupAccesses[*],userAccesses[*],aggregationType,expression,filter,expiryDays,user[id,name,phoneNumber],lastUpdatedBy[id,name,phoneNumber],createdBy[id,name],programIndicatorGroups[id,name,code,programIndicators[id,name]]`
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

  private async fetchDataElement(apiUrl: string, id: string) {
    return axios.get(
      `${apiUrl}dataElements/${id}.json?fields=:all,id,name,shortName,code,formName,description,created,lastUpdated,createdBy[id,name],lastUpdatedBy[id,name],valueType,aggregationType,domainType,zeroIsSignificant,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType,timelyDays]],programs[id,name]`
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

  private async fetchDataElementInValidationRule(apiUrl: string, id: string) {
    return axios.get(
      `${apiUrl}validationRules?fields=id&filter=leftSide.expression:like:${id}&filter=rightSide.expression:like:${id}&rootJunction=OR&paging=false`
    );
  }

  extractAllDataElementIds(expression: string): string[] {
    const regex = /R{([\w\d]+)\./g;
    const matches = [...expression.matchAll(regex)];
    return matches.map((match) => match[1]);
  }

  regex = /#{([A-Za-z0-9]{11})\.([A-Za-z0-9]{11})}/g;

  extractDataElements(input: string): string[] {
    const matches = [...input.matchAll(this.regex)];
    return matches.map((match) => match[1]);
  }

  filterExpressionregex = /#{[A-Za-z0-9]{11}\.([A-Za-z0-9]{11})}/g;

  extractDataElementsFromFilter(input: string): string[] {
    const matches = [...input.matchAll(this.filterExpressionregex)];
    return matches.map((match) => match[1]);
  }

  regexProgram = /I\{([A-Za-z0-9]{11})\}/g;

  extractProgramIndicators(input: string): string[] {
    const matches = [...input.matchAll(this.regexProgram)];
    return matches.map((match) => match[1]);
  }

  regexIndicator = /N\{([A-Za-z0-9]{11})\}/g;
  extractIndicators(input: string): string[] {
    const matches = [...input.matchAll(this.regexIndicator)];
    return matches.map((match) => match[1]);
  }

  extractIdentifiers(input: string): string[] {
    // Match any alphanumeric string of length 11
    const regex = /[A-Za-z0-9]{11}/g;
    const matches = [...(input || '').matchAll(regex)];
    return matches.map((match) => match[0]);
  }

  extractFunctionAndRule(
    ref: string
  ): { function: string; rule: string } | null {
    const match = ref.match(/^([A-Za-z0-9]{11})\.([A-Za-z0-9]{11})$/);
    if (!match) return null;
    return {
      function: match[1],
      rule: match[2],
    };
  }
}
