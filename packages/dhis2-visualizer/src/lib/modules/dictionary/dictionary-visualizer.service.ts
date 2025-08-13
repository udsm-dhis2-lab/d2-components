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
      const identifiableResponse = await this.fetchIdentifiableObject(
        id
      );

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
    const programIndicatorsResponse = await this.fetchProgramIndicator(
      apiUrl,
      id
    );
    const programIndicatorData = programIndicatorsResponse.data;

    const expressionDescription =
      await this.fetchProgramIndicatorExpressionDescription(
        apiUrl,
        programIndicatorData.expression,
        headers
      );
    let filterDescription: any;
    if (programIndicatorData.filter) {
      filterDescription = await this.fetchProgramIndicatorFilterDescription(
        apiUrl,
        programIndicatorData.filter,
        headers
      );
    }

    const programIndicatorInNumerator =
      await this.fetchProgramIndicatorInNumerator(
        apiUrl,
        programIndicatorData.id
      );
    const programIndicatorInDenominator =
      await this.fetchProgramIndicatorInDenominator(
        apiUrl,
        programIndicatorData.id
      );

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
    const dataElementResponse = await this.fetchDataElement(apiUrl, id);

    const dataElementInNumerator = await this.fetchDataElementInNumerator(
      apiUrl,
      id
    );

    const dataElementInDenominator = await this.fetchDataElementInDenominator(
      apiUrl,
      id
    );

    return {
      ...dataElementResponse.data,
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
      `${apiUrl}indicators.json?filter=numerator:like:${id}&fields=name`
    );
  }

  private async fetchDataElementInDenominator(apiUrl: string, id: string) {
    return axios.get(
      `${apiUrl}indicators.json?filter=denominator:like:${id}&fields=name`
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

// import axios from 'axios';

// export class MetadataService {
//   /**
//    * Fetch metadata by ID.
//    * @param id The ID of the metadata to fetch.
//    * @returns A Promise of the metadata.
//    */
//   async fetchMetadataById(id: string): Promise<any> {
//     const apiUrl = '../../../api/';
//     const headers = { headers: { 'Content-Type': 'text/plain' } };

//     try {
//       const identifiableResponse = await axios.get(
//         `${apiUrl}identifiableObjects/${id}`
//       );

//       const href: string = identifiableResponse.data?.href || '';

//       if (href.includes('indicators')) {
//         const indicatorsResponse = await axios.get(
//           `${apiUrl}indicators/${id}.json?fields=:all,user[name,email,phoneNumber],displayName,lastUpdatedBy[id,name,phoneNumber,email],id,name,numeratorDescription,denominatorDescription,denominator,numerator,annualized,decimals,indicatorType[name],user[name],userGroupAccesses[*],userAccesses[*],attributeValues[value,attribute[name]],indicatorGroups[id,name,code,indicators[id,name]]`
//         );
//         const indicatorData = indicatorsResponse.data;

//         // Extract IDs needed for parallel requests
//         const dataSetIdsFromNumerator = this.extractAllDataElementIds(
//           indicatorData.numerator
//         );
//         const dataSetIdsFromDenominator = this.extractAllDataElementIds(
//           indicatorData.denominator
//         );
//         const dataElementsFromIndicator = [
//           ...dataSetIdsFromNumerator,
//           ...dataSetIdsFromDenominator,
//         ];
//         const progIndicatorInNumerator = this.extractProgramIndicators(
//           indicatorData.numerator
//         );
//         const progIndicatorInDenominator = this.extractProgramIndicators(
//           indicatorData.denominator
//         );
//         const programIndicators = [
//           ...progIndicatorInDenominator,
//           ...progIndicatorInNumerator,
//         ];
//         const dataSetIds = [
//           ...(indicatorData.dataSets?.map(
//             (dataSet: { id: any }) => dataSet.id
//           ) || []),
//         ];

//         // Run all independent requests in parallel
//         const [
//           numeratorResponse,
//           denominatorResponse,
//           dataSetIdSourcesFromNumerator,
//           dataSetIdSourcesDenominator,
//           programIndicatorsInIndicator,
//           dataElementsInIndicator,
//           dataSetsInIndicator,
//         ] = await Promise.all([
//           axios.post(
//             `${apiUrl}29/indicators/expression/description`,
//             indicatorData.numerator,
//             headers
//           ),
//           axios.post(
//             `${apiUrl}29/indicators/expression/description`,
//             indicatorData.denominator,
//             headers
//           ),
//           axios.get(
//             `${apiUrl}dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&filter=dataSetElements.dataElement.id:in:[${dataSetIdsFromNumerator}]&paging=false`
//           ),
//           axios.get(
//             `${apiUrl}dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&filter=dataSetElements.dataElement.id:in:[${dataSetIdsFromDenominator}]&paging=false`
//           ),
//           axios.get(
//             `${apiUrl}programIndicators.json?filter=id:in:[${programIndicators}]&fields=*,programIndicatorGroups[id,name]`
//           ),
//           axios.get(
//             `${apiUrl}dataElements.json?filter=id:in:[${dataElementsFromIndicator}]&paging=false&fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name,dataElements~size]`
//           ),
//           axios.get(
//             `${apiUrl}dataSets.json?filter=id:in:[${dataSetIds}]&fields=*,organisationUnits[id,name],dataSetElements[dataElement[id,name]`
//           ),
//         ]);

//         const numeratorDescription = numeratorResponse.data.description;
//         const denominatorDescription = denominatorResponse.data.description;
//         const dataElements = dataElementsInIndicator.data.dataElements;

//         return {
//           ...indicatorData,
//           numeratorExpressionMeaning: numeratorDescription,
//           denominatorExpressionMeaning: denominatorDescription,
//           dataElementsList: dataElements,
//           dataElementsFromNumerator: dataSetIdsFromNumerator,
//           dataElementsFromDenominator: dataSetIdsFromDenominator,
//           programIndicatorsInIndicator:
//             programIndicatorsInIndicator.data.programIndicators,
//           dataSetsInIndicator: dataSetsInIndicator.data.dataSets,
//         };
//       } else if (href.includes('programIndicators')) {
//         // Fetch metadata for program indicators
//         const programIndicatorsResponse = await axios.get(
//           // `../../../api/programIndicators/${id}?fields=*`
//           // `${apiUrl}programIndicators/${id}.json?fields=:all,id,name,shortName,lastUpdated,analyticsPeriodBoundaries,created,userGroupAccesses[*],userAccesses[*],aggregationType,expression,filter,expiryDays,user[id,name,phoneNumber],lastUpdatedBy[id,name,phoneNumber],createdBy[id,name],programIndicatorGroups[id,name,code,programIndicators[id,name]],legendSet[name,symbolizer,legends~size]`
//           `${apiUrl}programIndicators/${id}.json?fields=:all,id,name,shortName,lastUpdated,analyticsPeriodBoundaries,created,userGroupAccesses[*],userAccesses[*],aggregationType,expression,filter,expiryDays,user[id,name,phoneNumber],lastUpdatedBy[id,name,phoneNumber],createdBy[id,name],programIndicatorGroups[id,name,code,programIndicators[id,name]]`
//         );

//         const programIndicatorData = programIndicatorsResponse.data;

//         const expressionDescription = await axios.post(
//           `${apiUrl}29/programIndicators/expression/description`,
//           programIndicatorData.expression,
//           headers
//         );
//         let filterDescription: any;
//         if (programIndicatorData.filter) {
//           filterDescription = await axios.post(
//             `${apiUrl}29/programIndicators/filter/description`,
//             programIndicatorData.filter,
//             headers
//           );
//         }

//         const programIndicatorInNumerator = await axios.get(
//           `${apiUrl}indicators.json?filter=numerator:like:${programIndicatorData.id}&fields=name,numerator,denominator,description,indicatorType[name]`
//         );
//         const programIndicatorInDenominator = await axios.get(
//           `${apiUrl}indicators.json?filter=denominator:like:${programIndicatorData.id}&fields=name,numerator,denominator,description,indicatorType[name]`
//         );

//         // const numeratorExpressionDescription = await axios.post(
//         //   `${apiUrl}29/indicators/expression/description`,
//         //   programIndicatorData.expression,
//         //   {
//         //     headers: {
//         //       'Content-Type': 'text/plain',
//         //     },
//         //   }
//         // );

//         // const denominatorExpressionDescription = await axios.post(
//         //   `${apiUrl}29/indicators/expression/description`,
//         //   programIndicatorData.expression,
//         //   {
//         //     headers: {
//         //       'Content-Type': 'text/plain',
//         //     },
//         //   }
//         // );

//         const programIndicatorFilter =
//           programIndicatorData.filter !== undefined
//             ? programIndicatorData.filter
//             : '';
//         const dataElementsFromFilter = this.extractDataElements(
//           programIndicatorFilter
//         );
//         const dataElementsFromExpression = this.extractDataElements(
//           programIndicatorData.expression
//         );
//         const dataElementsIds = [
//           // "LIn6LQ8jN39", "Skar5x9Wrcy", "iceY1WOYHah"
//           ...dataElementsFromExpression,
//           ...dataElementsFromFilter,
//         ];

//         const dataElementsInPogramIndicator = await axios.get(
//           `${apiUrl}dataElements.json?filter=id:in:[${dataElementsIds}]&paging=false&fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name,dataElements~size]`
//         );
//         //console.log('data elements from program',this.extractDataElements("(#{mlDzRw3ibhE.uochSI2xLGI} =='B53 -  Malaria, parasitologically conﬁrmed' || #{mlDzRw3ibhE.uochSI2xLGI} =='B54 -  Other and unspeciﬁed malaria') && (#{mlDzRw3ibhE.A0q2I8nTWcV} !='B53 -  Malaria, parasitologically conﬁrmed' && #{mlDzRw3ibhE.A0q2I8nTWcV} !='B54 -  Other and unspeciﬁed malaria') "))
//         return {
//           ...programIndicatorData,
//           programIndicatorExpression: expressionDescription.data.description,
//           filterDescription: programIndicatorData.filter
//             ? filterDescription.data.description
//             : '',
//           dataElementsInPogramIndicator:
//             dataElementsInPogramIndicator.data.dataElements,
//           indicatorsWithProgramIndicators: [
//             ...programIndicatorInNumerator.data.indicators,
//             ...programIndicatorInDenominator.data.indicators,
//           ],
//         };
//       } else if (href.includes('dataElements')) {
//         const dataElementResponse = await axios.get(
//           `${apiUrl}dataElements/${id}.json?fields=:all,id,name,shortName,code,formName,description,created,lastUpdated,createdBy[id,name],lastUpdatedBy[id,name],valueType,aggregationType,domainType,zeroIsSignificant,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType,timelyDays]],programs[id,name],validationRulesMatchCount,indicatorNumeratorExpressionMatchCount,indicatorDenominatorExpressionMatchCount`
//         );

//         const dataElementInNumerator = await axios.get(
//           `${apiUrl}indicators.json?filter=numerator:like:${id}&fields=name`
//         );

//         const dataElementInDenominator = await axios.get(
//           `${apiUrl}indicators.json?filter=denominator:like:${id}&fields=name`
//         );

//         return {
//           ...dataElementResponse.data,
//           dataElementInNumeratorLength:
//             dataElementInNumerator.data.indicators.length,
//           dataElementInDenominatorLength:
//             dataElementInDenominator.data.indicators.length,
//         };
//       } else {
//         throw new Error(`Unsupported type in href: ${href}`);
//       }
//     } catch (error: any) {
//       throw new Error(`Error fetching metadata: ${error.message}`);
//     }
//   }

//   extractAllDataElementIds(expression: string): string[] {
//     const regex = /R{([\w\d]+)\./g;
//     const matches = [...expression.matchAll(regex)];

//     // Map to extract the first capture group (data element IDs)
//     return matches.map((match) => match[1]);
//   }

//   // Regular expression to match and extract the data element IDs
//   regex = /#{[A-Za-z0-9]{11}\.([A-Za-z0-9]{11})}/g;

//   // Function to extract data elements from a string
//   extractDataElements(input: string): string[] {
//     const matches = [...input.matchAll(this.regex)];
//     return matches.map((match) => match[1]);
//   }

//   // Regular expression to match and extract the data element IDs
//   regexProgram = /I\{([A-Za-z0-9]{11})\}/g;

//   // Function to extract data elements from a string
//   extractProgramIndicators(input: string): string[] {
//     const matches = [...input.matchAll(this.regexProgram)];
//     return matches.map((match) => match[1]);
//   }
// }
