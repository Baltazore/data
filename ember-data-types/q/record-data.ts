import type { CollectionResourceRelationship, SingleResourceRelationship } from './ember-data-json-api';
import type { RecordIdentifier, StableRecordIdentifier } from './identifier';
import type { JsonApiResource, JsonApiValidationError } from './record-data-json-api';
import { Dict } from './utils';

/**
  @module @ember-data/store
*/

export interface ChangedAttributesHash {
  [key: string]: [string, string];
}

export interface RecordData {
  version?: '1';

  // Cache
  // =====
  getResourceIdentifier(): RecordIdentifier | undefined;

  pushData(data: JsonApiResource, calculateChange: true): string[];
  pushData(data: JsonApiResource, calculateChange?: false): void;
  pushData(data: JsonApiResource, calculateChange?: boolean): string[] | void;
  clientDidCreate(): void;
  _initRecordCreateOptions(options?: Dict<unknown>): { [key: string]: unknown };

  willCommit(): void;
  didCommit(data: JsonApiResource | null): void;
  commitWasRejected(recordIdentifier?: RecordIdentifier, errors?: JsonApiValidationError[]): void;

  unloadRecord(): void;

  // Attrs
  // =====
  getAttr(key: string): unknown;
  setDirtyAttribute(key: string, value: unknown): void;
  changedAttributes(): ChangedAttributesHash;
  hasChangedAttributes(): boolean;
  rollbackAttributes(): string[];

  // Relationships
  // =============
  getBelongsTo(key: string): SingleResourceRelationship;
  getHasMany(key: string): CollectionResourceRelationship;

  setDirtyBelongsTo(name: string, recordData: RecordData | null): void;
  setDirtyHasMany(key: string, recordDatas: RecordData[]): void;
  addToHasMany(key: string, recordDatas: RecordData[], idx?: number): void;
  removeFromHasMany(key: string, recordDatas: RecordData[]): void;

  // State
  // =============
  setIsDeleted?(identifier: StableRecordIdentifier, isDeleted: boolean): void;
  getErrors(recordIdentifier: RecordIdentifier): JsonApiValidationError[];
  isEmpty?(): boolean; // needs rfc
  isNew(): boolean;
  isDeleted(): boolean;
  isDeletionCommitted(): boolean;
}

export interface RecordDataV2 {
  version: '2';

  // Cache
  // =====

  pushData(identifier: StableRecordIdentifier, data: JsonApiResource, calculateChanges?: boolean): void | string[];
  clientDidCreate(identifier: StableRecordIdentifier, options: object): void;

  willCommit(identifier: StableRecordIdentifier): void;
  didCommit(identifier: StableRecordIdentifier, data: JsonApiResource | null): void;
  commitWasRejected(identifier: StableRecordIdentifier): void;

  unloadRecord(identifier: StableRecordIdentifier): void;

  // Attrs
  // =====

  getAttr(identifier: StableRecordIdentifier, propertyName: string): unknown;
  setAttr(identifier: StableRecordIdentifier, propertyName: string, value: unknown): void;
  changedAttrs(identifier: StableRecordIdentifier): ChangedAttributesHash;
  hasChangedAttrs(identifier: StableRecordIdentifier): boolean;
  rollbackAttrs(identifier: StableRecordIdentifier): string[];

  // Relationships
  // =============
  getRelationship(
    identifier: StableRecordIdentifier,
    propertyName: string
  ): SingleResourceRelationship | CollectionResourceRelationship;

  setBelongsTo(identifier: StableRecordIdentifier, propertyName: string, value: StableRecordIdentifier | null): void;
  setHasMany(identifier: StableRecordIdentifier, propertyName: string, value: StableRecordIdentifier[]): void;
  addToHasMany(
    identifier: StableRecordIdentifier,
    propertyName: string,
    value: StableRecordIdentifier[],
    idx?: number
  ): void;
  removeFromHasMany(identifier: StableRecordIdentifier, propertyName: string, value: StableRecordIdentifier[]): void;

  // State
  // =============
  setIsDeleted(identifier: StableRecordIdentifier, isDeleted: boolean): void;
  getErrors(identifier: StableRecordIdentifier): JsonApiValidationError[];
  isEmpty(identifier: StableRecordIdentifier): boolean;
  isNew(identifier: StableRecordIdentifier): boolean;
  isDeleted(identifier: StableRecordIdentifier): boolean;
  isDeletionCommitted(identifier: StableRecordIdentifier): boolean;
}
