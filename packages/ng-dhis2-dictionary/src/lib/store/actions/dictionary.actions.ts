import { Action } from '@ngrx/store';
import { MetadataDictionary } from '../../models/dictionary';

export enum DictionaryActionTypes {
  InitializeDictionaryMetadata = '[Dictionary] initialize incoming metadata',
  AddDictionaryMetadataList = '[Dictionary] add dictionary metadata list',
  UpdateDictionaryMetadata = '[Dictionary] update dictionary metadata list'
}

export class InitializeDictionaryMetadataAction implements Action {
  readonly type = DictionaryActionTypes.InitializeDictionaryMetadata;
  constructor(public dictionaryMetadataIdentifiers: Array<string>) {}
}

export class AddDictionaryMetadataListAction implements Action {
  readonly type = DictionaryActionTypes.AddDictionaryMetadataList;
  constructor(public dictionaryMetadataList: MetadataDictionary[]) {}
}

export class UpdateDictionaryMetadataAction implements Action {
  readonly type = DictionaryActionTypes.UpdateDictionaryMetadata;
  constructor(
    public dictionaryMetadataId: string,
    public changes: Partial<MetadataDictionary>
  ) {}
}

export type DictionaryActions =
  | InitializeDictionaryMetadataAction
  | AddDictionaryMetadataListAction
  | UpdateDictionaryMetadataAction;
