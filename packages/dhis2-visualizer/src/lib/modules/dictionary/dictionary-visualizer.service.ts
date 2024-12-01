import axios from 'axios';

export class MetadataService {
  /**
   * Fetch metadata by ID.
   * @param id The ID of the metadata to fetch.
   * @returns A Promise of the metadata.
   */
  async fetchMetadataById(id: string): Promise<any> {
    try {
      // Step 1: Fetch identifiable object details
      const identifiableResponse = await axios.get(
        `../../../api/identifiableObjects/${id}`
      );

      const href: string = identifiableResponse.data?.href || '';

      // Step 2: Check the type of the ID and fetch corresponding metadata
      if (href.includes('indicators')) {
        // Fetch metadata for indicators
        const indicatorsResponse = await axios.get(
          // `../../../api/indicators/${id}?fields=*,indicatorType[name]`
          `../../../api/indicators/${id}.json?fields=:all,user[name,email,phoneNumber],displayName,lastUpdatedBy[id,name,phoneNumber,email],id,name,numeratorDescription,denominatorDescription,denominator,numerator,annualized,decimals,indicatorType[name],user[name],userGroupAccesses[*],userAccesses[*],attributeValues[value,attribute[name]],indicatorGroups[id,name,code,indicators[id,name]],legendSet[name,symbolizer,legends~size],dataSets[name]`
        );
        // return indicatorsResponse.data;
        const indicatorData = indicatorsResponse.data;

        // Fetch numerator expression meaning
        const numeratorResponse = await axios.post(
          `../../../api/indicators/expression/description/`,
          indicatorData.numerator
        );
        const numeratorDescription = numeratorResponse.data.message;

        // Fetch denominator expression meaning
        const denominatorResponse = await axios.post(
          `../../../api/indicators/expression/description/`,
          indicatorData.denominator
        );
        const denominatorDescription = denominatorResponse.data.message;

        const dataSetIdsFromNumerator = this.extractAllDataElementIds(
          indicatorData.numerator
        );

        const dataSetIdsFromDenominator = this.extractAllDataElementIds(
          indicatorData.denominator
        );

        console.log('dataSetIdsFromNumerator', dataSetIdsFromNumerator);
        console.log('dataSetIdsFromDenominator', dataSetIdsFromDenominator);

        const dataSetIdSourcesFromNumerator = await axios.get(
          `../../../api/dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&filter=dataSetElements.dataElement.id:in:[${dataSetIdsFromNumerator}]&paging=false`
        );

        const dataSetIdSourcesDenominator = await axios.get(
          `../../../api/dataSets.json?fields=periodType,id,name,timelyDays,formType,created,expiryDays&filter=dataSetElements.dataElement.id:in:[${dataSetIdsFromDenominator}]&paging=false`
        );

        // Add the fetched descriptions to the indicator data
        return {
          ...indicatorData,
          numeratorExpressionMeaning: numeratorDescription,
          denominatorExpressionMeaning: denominatorDescription,
        };
      } else if (href.includes('programIndicators')) {
        // Fetch metadata for program indicators
        const programIndicatorsResponse = await axios.get(
        // `../../../api/programIndicators/${id}?fields=*`
          `../../../api/programIndicators/${id}.json?fields=*,id,name,shortName,lastUpdated,analyticsPeriodBoundaries,created,userGroupAccesses[*],userAccesses[*],aggregationType,expression,filter,expiryDays,user[id,name,phoneNumber],lastUpdatedBy[id,name,phoneNumber],program[id,name,programIndicators[id,name]]`
        );
        return programIndicatorsResponse.data;
      } else {
        // Throw an error if the type is unsupported
        throw new Error(`Unsupported type in href: ${href}`);
      }
    } catch (error: any) {
      // Handle and rethrow the error
      throw new Error(`Error fetching metadata: ${error.message}`);
    }
  }

  extractAllDataElementIds(expression: string): string[] {
    const regex = /R{([\w\d]+)\./g;
    const matches = [...expression.matchAll(regex)];

    // Map to extract the first capture group (data element IDs)
    return matches.map((match) => match[1]);
  }
}
