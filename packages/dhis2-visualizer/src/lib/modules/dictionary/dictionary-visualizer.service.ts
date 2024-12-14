import axios from 'axios';

export class MetadataService {
  /**
   * Fetch metadata by ID.
   * @param id The ID of the metadata to fetch.
   * @returns A Promise of the metadata.
   */
  async fetchMetadataById(id: string): Promise<any> {
    const apiUrl = '../../../api/';
    try {
      const identifiableResponse = await axios.get(
        `${apiUrl}identifiableObjects/${id}`
      );

      const href: string = identifiableResponse.data?.href || '';

      if (href.includes('indicators')) {
        const indicatorsResponse = await axios.get(
          // `../../../api/indicators/${id}?fields=*,indicatorType[name]`
          `${apiUrl}indicators/${id}.json?fields=:all,user[name,email,phoneNumber],displayName,lastUpdatedBy[id,name,phoneNumber,email],id,name,numeratorDescription,denominatorDescription,denominator,numerator,annualized,decimals,indicatorType[name],user[name],userGroupAccesses[*],userAccesses[*],attributeValues[value,attribute[name]],indicatorGroups[id,name,code,indicators[id,name]],legendSet[name,symbolizer,legends~size]]`
        );

        const indicatorData = indicatorsResponse.data;

        const numeratorResponse = await axios.post(
          `${apiUrl}29/indicators/expression/description`,
          indicatorData.numerator,
          {
            headers: {
              'Content-Type': 'text/plain',
            },
          }
        );
        const numeratorDescription = numeratorResponse.data.description;

        const denominatorResponse = await axios.post(
          `${apiUrl}29/indicators/expression/description`,
          indicatorData.denominator,
          {
            headers: {
              'Content-Type': 'text/plain',
            },
          }
        );
        const denominatorDescription = denominatorResponse.data.description;

        const dataSetIdsFromNumerator = this.extractAllDataElementIds(
          indicatorData.numerator
        );

        const dataSetIdsFromDenominator = this.extractAllDataElementIds(
          indicatorData.denominator
        );

        const dataElementsFromIndicator = [...dataSetIdsFromNumerator, ...dataSetIdsFromDenominator];

        const dataSetIdSourcesFromNumerator = await axios.get(
          `${apiUrl}dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&filter=dataSetElements.dataElement.id:in:[${dataSetIdsFromNumerator}]&paging=false`
        );

        const dataSetIdSourcesDenominator = await axios.get(
          `${apiUrl}dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&filter=dataSetElements.dataElement.id:in:[${dataSetIdsFromDenominator}]&paging=false`
        );

        console.log('prg',this.extractProgramIndicators("I{DrrU5I4BAnX}fjndcjnsdjdjddsnnI{PrrU5I4BAnX}"));
        const progIndicatorInNumerator = this.extractProgramIndicators(indicatorData.numerator);
        const progIndicatorInDenominator = this.extractProgramIndicators(indicatorData.denominator);
        const programIndicators = [...progIndicatorInDenominator, ...progIndicatorInNumerator];

        const programIndicatorsInIndicator = await axios.get(
          `${apiUrl}programIndicators.json?filter=id:in:[${programIndicators}]&fields=*,programIndicatorGroups[id,name]`
        );

        const dataElementsInIndicator = await axios.get(
          `${apiUrl}dataElements.json?filter=id:in:[${dataElementsFromIndicator}]&paging=false&
        fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,
        categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],
        dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name,dataElements~size]`
        );

        const dataSetIds = [...indicatorData.dataSets.map((dataSet: { id: any; }) => dataSet.id)];
        console.log('data set ids', dataSetIds);

        const dataSetsInIndicator = await axios.get(
          `${apiUrl}dataSets.json?filter=id:in:[${dataSetIds}]&fields=*,organisationUnits[id,name],dataSetElements[dataElement[id,name]`
        );

        //,dataSets[*,organisationUnits[id,name],dataSetElements[dataElement[id,name]]

        const dataElements = dataElementsInIndicator.data.dataElements;
       
        console.log('dataset',indicatorData.dataSets);
        // Add the fetched descriptions to the indicator data
        return {
          ...indicatorData,
          numeratorExpressionMeaning: numeratorDescription,
          denominatorExpressionMeaning: denominatorDescription,
          dataElementsList: dataElements,
          dataElementsFromNumerator: dataSetIdsFromNumerator,
          dataElementsFromDenominator: dataSetIdsFromDenominator,
          programIndicatorsInIndicator: programIndicatorsInIndicator.data.programIndicators,
          dataSetsInIndicator: dataSetsInIndicator.data.dataSets,
        };
      } else if (href.includes('programIndicators')) {
        // Fetch metadata for program indicators
        const programIndicatorsResponse = await axios.get(
          // `../../../api/programIndicators/${id}?fields=*`
          `${apiUrl}programIndicators/${id}.json?fields=:all,id,name,shortName,lastUpdated,analyticsPeriodBoundaries,created,userGroupAccesses[*],userAccesses[*],aggregationType,expression,filter,expiryDays,user[id,name,phoneNumber],lastUpdatedBy[id,name,phoneNumber],program[id,name,programIndicators[id,name]],programIndicatorGroups[id,name,code,programIndicators[id,name]],legendSet[name,symbolizer,legends~size]`
        );

        const programIndicatorData = programIndicatorsResponse.data;

        const expressionDescription = await axios.post(
          `${apiUrl}29/programIndicators/expression/description`,
          programIndicatorData.expression,
          {
            headers: {
              'Content-Type': 'text/plain',
            },
          }
        );
        let filterDescription: any;
        if (programIndicatorData.filter) {
          filterDescription = await axios.post(
            `${apiUrl}29/programIndicators/filter/description`,
            programIndicatorData.filter,
            {
              headers: {
                'Content-Type': 'text/plain',
              },
            }
          );
        }

        const programIndicatorInNumerator = await axios.get(
          `${apiUrl}indicators.json?filter=numerator:like:${programIndicatorData.id}&fields=name,numerator,denominator,description,indicatorType[name]`
        );
        console.log('program in num', programIndicatorInNumerator);
        const programIndicatorInDenominator = await axios.get(
          `${apiUrl}indicators.json?filter=denominator:like:${programIndicatorData.id}&fields=name,numerator,denominator,description,indicatorType[name]`
        );

        // const numeratorExpressionDescription = await axios.post(
        //   `${apiUrl}29/indicators/expression/description`,
        //   programIndicatorData.expression,
        //   {
        //     headers: {
        //       'Content-Type': 'text/plain',
        //     },
        //   }
        // );

        // const denominatorExpressionDescription = await axios.post(
        //   `${apiUrl}29/indicators/expression/description`,
        //   programIndicatorData.expression,
        //   {
        //     headers: {
        //       'Content-Type': 'text/plain',
        //     },
        //   }
        // );

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
          // "LIn6LQ8jN39", "Skar5x9Wrcy", "iceY1WOYHah"
          ...dataElementsFromExpression,
          ...dataElementsFromFilter,
        ];
        console.log('data element ids', dataElementsIds);

        const dataElementsInPogramIndicator = await axios.get(
          `${apiUrl}dataElements.json?filter=id:in:[${dataElementsIds}]&paging=false&fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name,dataElements~size]`
        );
        //console.log('data elements from program',this.extractDataElements("(#{mlDzRw3ibhE.uochSI2xLGI} =='B53 -  Malaria, parasitologically conﬁrmed' || #{mlDzRw3ibhE.uochSI2xLGI} =='B54 -  Other and unspeciﬁed malaria') && (#{mlDzRw3ibhE.A0q2I8nTWcV} !='B53 -  Malaria, parasitologically conﬁrmed' && #{mlDzRw3ibhE.A0q2I8nTWcV} !='B54 -  Other and unspeciﬁed malaria') "))
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
      } else {
        throw new Error(`Unsupported type in href: ${href}`);
      }
    } catch (error: any) {
      throw new Error(`Error fetching metadata: ${error.message}`);
    }
  }

  extractAllDataElementIds(expression: string): string[] {
    const regex = /R{([\w\d]+)\./g;
    const matches = [...expression.matchAll(regex)];

    // Map to extract the first capture group (data element IDs)
    return matches.map((match) => match[1]);
  }

  // Regular expression to match and extract the data element IDs
  regex = /#{[A-Za-z0-9]{11}\.([A-Za-z0-9]{11})}/g;

  // Function to extract data elements from a string
  extractDataElements(input: string): string[] {
    const matches = [...input.matchAll(this.regex)];
    return matches.map((match) => match[1]);
  }

   // Regular expression to match and extract the data element IDs
   regexProgram = /I\{([A-Za-z0-9]{11})\}/g;


   // Function to extract data elements from a string
   extractProgramIndicators(input: string): string[] {
     const matches = [...input.matchAll(this.regexProgram)];
     return matches.map((match) => match[1]);
   }
}

// http://41.59.227.69/tland-upgrade/api/dataElements.json?filter=id:in:[zUVxutsJ6eR,B9q04d4HYUi,ATqlMZypG0h]&paging=false&fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name,dataElements~size]

// import axios from 'axios';

// export class MetadataService {
//   /**
//    * Fetch metadata by ID.
//    * @param id The ID of the metadata to fetch.
//    * @returns A Promise of the metadata.
//    */
//   async fetchMetadataById(id: string): Promise<any> {
//     const apiUrl = '../../../api/';
//     try {
//       const identifiableResponse = await axios.get(
//         `${apiUrl}identifiableObjects/${id}`
//       );

//       const href: string = identifiableResponse.data?.href || '';

//       if (href.includes('indicators')) {
//         const indicatorsResponse = await axios.get(
//           `${apiUrl}indicators/${id}.json?fields=:all,user[name,email,phoneNumber],displayName,lastUpdatedBy[id,name,phoneNumber,email],id,name,numeratorDescription,denominatorDescription,denominator,numerator,annualized,decimals,indicatorType[name],user[name],userGroupAccesses[*],userAccesses[*],attributeValues[value,attribute[name]],indicatorGroups[id,name,code,indicators[id,name]],legendSet[name,symbolizer,legends~size],dataSets[name]`
//         );

//         const indicatorData = indicatorsResponse.data;

//         const dataSetIdsFromNumerator = this.extractAllDataElementIds(
//           indicatorData.numerator
//         );

//         const dataSetIdsFromDenominator = this.extractAllDataElementIds(
//           indicatorData.denominator
//         );

//         // Use Promise.all to fetch data concurrently
//         const [
//           numeratorDescriptionResponse,
//           denominatorDescriptionResponse,
//           dataSetIdSourcesFromNumeratorResponse,
//           dataSetIdSourcesDenominatorResponse,
//           dataElementsInIndicatorResponse
//         ] = await Promise.all([
//           axios.post(
//             `${apiUrl}29/indicators/expression/description`,
//             indicatorData.numerator,
//             { headers: { 'Content-Type': 'text/plain' } }
//           ),
//           axios.post(
//             `${apiUrl}29/indicators/expression/description`,
//             indicatorData.denominator,
//             { headers: { 'Content-Type': 'text/plain' } }
//           ),
//           axios.get(
//             `${apiUrl}dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&filter=dataSetElements.dataElement.id:in:[${dataSetIdsFromNumerator}]&paging=false`
//           ),
//           axios.get(
//             `${apiUrl}dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&filter=dataSetElements.dataElement.id:in:[${dataSetIdsFromDenominator}]&paging=false`
//           ),
//           axios.get(
//             `${apiUrl}dataElements.json?filter=id:in:[${dataSetIdsFromNumerator},${dataSetIdsFromDenominator}]&paging=false&fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name,dataElements~size]`
//           ),
//         ]);

//         // Extract data from responses
//         const numeratorDescription = numeratorDescriptionResponse.data.description;
//         const denominatorDescription = denominatorDescriptionResponse.data.description;
//         const dataSetIdSourcesFromNumerator = dataSetIdSourcesFromNumeratorResponse.data;
//         const dataSetIdSourcesDenominator = dataSetIdSourcesDenominatorResponse.data;
//         const dataElements = dataElementsInIndicatorResponse.data.dataElements;

//         // Add the fetched descriptions to the indicator data
//         return {
//           ...indicatorData,
//           numeratorExpressionMeaning: numeratorDescription,
//           denominatorExpressionMeaning: denominatorDescription,
//           dataElementsList: dataElements,
//           dataElementsFromNumerator: dataSetIdsFromNumerator,
//           dataElementsFromDenominator: dataSetIdsFromDenominator,
//         };
//       } else if (href.includes('programIndicators')) {
//         // Fetch metadata for program indicators
//         const programIndicatorsResponse = await axios.get(
//           `${apiUrl}programIndicators/${id}.json?fields=:all,id,name,shortName,lastUpdated,analyticsPeriodBoundaries,created,userGroupAccesses[*],userAccesses[*],aggregationType,expression,filter,expiryDays,user[id,name,phoneNumber],lastUpdatedBy[id,name,phoneNumber],program[id,name,programIndicators[id,name]]`
//         );

//         const programIndicatorData = programIndicatorsResponse.data;

//         const expressionDescription = await axios.post(
//           `${apiUrl}29/programIndicators/expression/description`,
//           programIndicatorData.expression,
//           {
//             headers: {
//               'Content-Type': 'text/plain',
//             },
//           }
//         );
//         let filterDescription: any;
//         if (programIndicatorData.filter) {
//           filterDescription = await axios.post(
//             `${apiUrl}29/programIndicators/filter/description`,
//             programIndicatorData.filter,
//             {
//               headers: {
//                 'Content-Type': 'text/plain',
//               },
//             }
//           );
//         }
//         const dataElementsInPogramIndicator = await axios.get(
//           `${apiUrl}dataElements.json?filter=id:in:[${expressionDescription},${filterDescription}]&paging=false&fields=id,name,zeroIsSignificant,aggregationType,domainType,valueType,categoryCombo[id,name,categoryOptionCombos[id,name,categoryOptions[id,name,categories[id,name]]]],dataSetElements[dataSet[id,name,periodType]],dataElementGroups[id,name,dataElements~size]`
//         );

//         return {
//           ...programIndicatorData,
//           programIndicatorExpression: expressionDescription.data.description,
//           filterDescription: programIndicatorData.filter
//             ? filterDescription.data.description
//             : '',
//           dataElementsInPogramIndicator: dataElementsInPogramIndicator,
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
// }
