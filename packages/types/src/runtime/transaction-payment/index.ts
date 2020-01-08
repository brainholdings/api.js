// Copyright 2019 Centrality Investments Limited
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

import {AnyNumber, AnyU8a} from '@polkadot/types/types';
import Compact from '@polkadot/types/codec/Compact';
import Option from '@polkadot/types/codec/Option';
import Struct from '@polkadot/types/codec/Struct';
import {Balance} from '@polkadot/types/interfaces/runtime';
import {Enum} from '@polkadot/types';

/* [[FeeExchangeV1]] when included in a transaction it indicates network fees should be
 * paid in `assetId` by paying up to `maxPayment` after the exchange rate is calculated.
 */
export class FeeExchangeV1 extends Struct {
  assetId: AnyNumber;
  maxPayment: AnyNumber;
}

// The outer [[FeeExchange]] it is an enum to allow flexbility for future versions and backwards compatability.
export class FeeExchange extends Enum.with({FeeExchangeV1}) {}

/**
 * [[ChargeTransactionPayment]] allows paying a `tip` and/or specifying fee payment in another currency
 * when added to an extrinsic payload.
 */
export default class ChargeTransactionPayment extends Struct {
  tip: Compact<Balance>;
  feeExchange: Option<FeeExchange>;
}
