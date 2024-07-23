export interface MetadataDictionary {
  id: string;
  name: string;
  category?: string;
  description: string;
  progress: {
    loading: boolean;
    loadingSucceeded: boolean;
    loadingFailed: boolean;
  };
}
