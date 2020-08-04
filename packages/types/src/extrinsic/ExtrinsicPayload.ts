// Copyright 2017-2020 @polkadot/types authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {u8aToHex} from '@polkadot/util';
import Base from '@polkadot/types/codec/Base';
import Compact from '@polkadot/types/codec/Compact';
import Raw from '@polkadot/types/codec/Raw';
import u32 from '@polkadot/types/primitive/U32';
import ExtrinsicEra from '@polkadot/types/Extrinsic/ExtrinsicEra';
import {Balance, Hash, Index} from '@polkadot/types/interfaces/runtime';
import {ExtrinsicPayloadV1, ExtrinsicPayloadV2, ExtrinsicPayloadV3} from '@polkadot/types/interfaces/extrinsics';

import ExtrinsicPayloadV4 from './v4/ExtrinsicPayload';
import {AnyJson, BareOpts, ExtrinsicPayloadValue, IKeyringPair, InterfaceTypes, Registry} from '../types';
import {DEFAULT_VERSION} from './constants';

interface ExtrinsicPayloadOptions {
  version?: number;
}

// all our known types that can be returned
type ExtrinsicPayloadVx = ExtrinsicPayloadV1 | ExtrinsicPayloadV2 | ExtrinsicPayloadV3 | ExtrinsicPayloadV4;

const VERSIONS: (keyof InterfaceTypes)[] = [
  'ExtrinsicPayloadUnknown', // v0 is unknown
  'ExtrinsicPayloadV1',
  'ExtrinsicPayloadV2',
  'ExtrinsicPayloadV3',
  'ExtrinsicPayloadV4',
];

/**
 * @name GenericExtrinsicPayload
 * @description
 * A signing payload for an [[Extrinsic]]. For the final encoding, it is variable length based
 * on the contents included
 */
export default class ExtrinsicPayload extends Base<ExtrinsicPayloadVx> {
  constructor(
    registry: Registry,
    value: Partial<ExtrinsicPayloadValue> | Uint8Array | string | undefined,
    {version}: ExtrinsicPayloadOptions = {}
  ) {
    super(registry, ExtrinsicPayload.decodeExtrinsicPayload(registry, value as ExtrinsicPayloadValue, version));
  }

  /** @internal */
  public static decodeExtrinsicPayload(
    registry: Registry,
    value: ExtrinsicPayload | ExtrinsicPayloadValue | Uint8Array | string | undefined,
    version: number = DEFAULT_VERSION
  ): ExtrinsicPayloadVx {
    if (value instanceof ExtrinsicPayload) {
      return value._raw;
    }

    return registry.createType(VERSIONS[version] || VERSIONS[0], value, {version}) as ExtrinsicPayloadVx;
  }

  /**
   * @description The block [[Hash]] the signature applies to (mortal/immortal)
   */
  public get blockHash(): Hash {
    return this._raw.blockHash;
  }

  /**
   * @description The [[ExtrinsicEra]]
   */
  public get era(): ExtrinsicEra {
    return this._raw.era;
  }

  /**
   * @description The genesis block [[Hash]] the signature applies to
   */
  public get genesisHash(): Hash {
    // NOTE only v3+
    return (this._raw as ExtrinsicPayloadV4).genesisHash || this.registry.createType('Hash');
  }

  /**
   * @description The [[Raw]] contained in the payload
   */
  public get method(): Raw {
    return this._raw.method;
  }

  /**
   * @description The [[Index]]
   */
  public get nonce(): Compact<Index> {
    return this._raw.nonce;
  }

  /**
   * @description The specVersion as a [[u32]] for this payload
   */
  public get specVersion(): u32 {
    // NOTE only v3+
    return (this._raw as ExtrinsicPayloadV4).specVersion || this.registry.createType('u32');
  }

  /**
   * @description The [[Balance]]
   */
  public get tip(): Compact<Balance> {
    // NOTE from v4+
    return (this._raw as ExtrinsicPayloadV4).tip || this.registry.createType('Compact<Balance>');
  }

  /**
   * @description Compares the value of the input to see if there is a match
   */
  public eq(other?: any): boolean {
    return this._raw.eq(other);
  }

  /**
   * @description Sign the payload with the keypair
   */
  public sign(signerPair: IKeyringPair): {signature: string} {
    const signature = this._raw.sign(signerPair);

    // This is extensible, so we could quite readily extend to send back extra
    // information, such as for instance the payload, i.e. `payload: this.toHex()`
    // For the case here we sign via the extrinsic, we ignore the return, so generally
    // this is applicable for external signing
    return {
      signature: u8aToHex(signature),
    };
  }

  /**
   * @description Converts the Object to to a human-friendly JSON, with additional fields, expansion and formatting of information
   */
  public toHuman(isExtended?: boolean): AnyJson {
    return this._raw.toHuman(isExtended);
  }

  /**
   * @description Converts the Object to JSON, typically used for RPC transfers
   */
  public toJSON(): any {
    return this.toHex();
  }

  /**
   * @description Returns the string representation of the value
   */
  public toString(): string {
    return this.toHex();
  }

  /**
   * @description Returns a serialized u8a form
   */
  public toU8a(isBare?: BareOpts): Uint8Array {
    // call our parent, with only the method stripped
    return super.toU8a(isBare ? {method: true} : false);
  }
}
