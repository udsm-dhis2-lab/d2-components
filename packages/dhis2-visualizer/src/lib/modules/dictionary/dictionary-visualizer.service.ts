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
          `../../../api/indicators/${id}?fields=*,indicatorType[name]`
        );
        return indicatorsResponse.data;
      } else if (href.includes('programIndicators')) {
        // Fetch metadata for program indicators
        const programIndicatorsResponse = await axios.get(
          `../../../api/programIndicators/${id}?fields=*`
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
}

