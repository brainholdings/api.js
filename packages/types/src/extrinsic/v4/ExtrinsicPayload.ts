// Copyright 2020 Centrality Investments Limited & @polkadot/types authors & contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// tslint:disable member-ordering no-magic-numbers
import {Bytes, Compact, Struct, u32} from '@polkadot/types';
import {Balance, Hash} from '@polkadot/types/interfaces/runtime';
import ExtrinsicEra from '@polkadot/types/Extrinsic/ExtrinsicEra';
import {sign} from '@polkadot/types/Extrinsic/util';
import Option from '@polkadot/types/codec/Option';

import Doughnut from '../../Doughnut';
import {ChargeTransactionPayment, Index} from '../../runtime';
import {ExtrinsicPayloadValue, IKeyringPair, Registry} from '../../types';
import {CennznetInterfaceTypes} from '../types';

// The base of an extrinsic payload
export const BasePayloadV4: Record<string, CennznetInterfaceTypes> = {
  method: 'Bytes',
  doughnut: 'Option<Doughnut>',
  era: 'ExtrinsicEra',
  nonce: 'Compact<Index>',
  transactionPayment: 'ChargeTransactionPayment',
};

// These fields are signed here as part of the extrinsic signature but are NOT encoded in
// the final extrinsic payload itself.
// The CENNZnet node will populate these fields from on-chain data and check the signature compares
// hence 'implicit'
export const PayloadImplicitAddonsV4: Record<string, CennznetInterfaceTypes> = {
  specVersion: 'u32',
  // system::CheckGenesis<Runtime>
  genesisHash: 'Hash',
  // system::CheckEra<Runtime>
  blockHash: 'Hash',
};

// The full definition for the extrinsic payload.
// It will be encoded (+ hashed if len > 256) and then signed to make the extrinsic signature
export const FullPayloadV4: Record<string, CennznetInterfaceTypes> = {
  ...BasePayloadV4,
  ...PayloadImplicitAddonsV4,
};
/**
 * @name ExtrinsicPayloadV4
 * @description
 * A signing payload for an [[Extrinsic]]. For the final encoding, it is variable length based
 * on the contents included
 *
 *   1-8 bytes: The Transaction Compact<Index/Nonce> as provided in the transaction itself.
 *   2+ bytes: The Function Descriptor as provided in the transaction itself.
 *   1/2 bytes: The Transaction Era as provided in the transaction itself.
 *   32 bytes: The hash of the authoring block implied by the Transaction Era and the current block.
 */
export default class ExtrinsicPayloadV4 extends Struct {
  constructor(registry: Registry, value?: ExtrinsicPayloadValue | Uint8Array | string) {
    super(registry, FullPayloadV4, value);
  }

  /**
   * @description The block [[Hash]] the signature applies to (mortal/immortal)
   */
  get blockHash(): Hash {
    return this.get('blockHash') as Hash;
  }

  /**
   * @description The genesis [[Hash]] the signature applies to (mortal/immortal)
   */
  get genesisHash(): Hash {
    return this.get('genesisHash') as Hash;
  }

  /**
   * @description The [[Bytes]] contained in the payload
   */
  get method(): Bytes {
    return this.get('method') as Bytes;
  }

  /**
   * @description The [[ExtrinsicEra]]
   */
  get era(): ExtrinsicEra {
    return this.get('era') as ExtrinsicEra;
  }

  /**
   * @description The [[Index]]
   */
  get nonce(): Compact<Index> {
    return this.get('nonce') as Compact<Index>;
  }

  /**
   * @description The specVersion for this signature
   */
  get specVersion(): u32 {
    return this.get('specVersion') as u32;
  }

  /**
   * @description tip (here for compatibility with [[IExtrinsic]] definition)
   */
  get tip(): Compact<Balance> {
    return this.transactionPayment.tip as Compact<Balance>;
  }

  /**
   * @description The transaction fee metadata e.g tip, fee exchange
   */
  get transactionPayment(): ChargeTransactionPayment {
    return this.get('transactionPayment') as ChargeTransactionPayment;
  }

  /**
   * @description The [[Doughnut]]
   */
  get doughnut(): Option<Doughnut> {
    return this.get('doughnut') as Option<Doughnut>;
  }

  /**
   * @description Sign the payload with the keypair
   */
  sign(signerPair: IKeyringPair): Uint8Array {
    return sign(signerPair, this.toU8a({method: true}), {withType: true});
  }
}
