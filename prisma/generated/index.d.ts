
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model AuditLog
 * 
 */
export type AuditLog = $Result.DefaultSelection<Prisma.$AuditLogPayload>
/**
 * Model Warehouse
 * 
 */
export type Warehouse = $Result.DefaultSelection<Prisma.$WarehousePayload>
/**
 * Model Outlet
 * 
 */
export type Outlet = $Result.DefaultSelection<Prisma.$OutletPayload>
/**
 * Model Category
 * 
 */
export type Category = $Result.DefaultSelection<Prisma.$CategoryPayload>
/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model Variant
 * 
 */
export type Variant = $Result.DefaultSelection<Prisma.$VariantPayload>
/**
 * Model Stock
 * 
 */
export type Stock = $Result.DefaultSelection<Prisma.$StockPayload>
/**
 * Model Party
 * 
 */
export type Party = $Result.DefaultSelection<Prisma.$PartyPayload>
/**
 * Model Transaction
 * 
 */
export type Transaction = $Result.DefaultSelection<Prisma.$TransactionPayload>
/**
 * Model TransactionItem
 * 
 */
export type TransactionItem = $Result.DefaultSelection<Prisma.$TransactionItemPayload>
/**
 * Model Account
 * 
 */
export type Account = $Result.DefaultSelection<Prisma.$AccountPayload>
/**
 * Model LedgerEntry
 * 
 */
export type LedgerEntry = $Result.DefaultSelection<Prisma.$LedgerEntryPayload>
/**
 * Model VendorProduct
 * 
 */
export type VendorProduct = $Result.DefaultSelection<Prisma.$VendorProductPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  SALES: 'SALES',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER'
};

export type Role = (typeof Role)[keyof typeof Role]


export const PartyType: {
  VENDOR: 'VENDOR',
  CUSTOMER: 'CUSTOMER'
};

export type PartyType = (typeof PartyType)[keyof typeof PartyType]


export const TxType: {
  PURCHASE_ORDER: 'PURCHASE_ORDER',
  GRN: 'GRN',
  PURCHASE_BILL: 'PURCHASE_BILL',
  DEBIT_NOTE: 'DEBIT_NOTE',
  QUOTATION: 'QUOTATION',
  PROFORMA_INVOICE: 'PROFORMA_INVOICE',
  DELIVERY_CHALLAN: 'DELIVERY_CHALLAN',
  SALES_INVOICE: 'SALES_INVOICE',
  CREDIT_NOTE: 'CREDIT_NOTE',
  STOCK_TRANSFER: 'STOCK_TRANSFER',
  STOCK_ADJUSTMENT: 'STOCK_ADJUSTMENT'
};

export type TxType = (typeof TxType)[keyof typeof TxType]


export const AccountGroup: {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  EQUITY: 'EQUITY',
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE'
};

export type AccountGroup = (typeof AccountGroup)[keyof typeof AccountGroup]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type PartyType = $Enums.PartyType

export const PartyType: typeof $Enums.PartyType

export type TxType = $Enums.TxType

export const TxType: typeof $Enums.TxType

export type AccountGroup = $Enums.AccountGroup

export const AccountGroup: typeof $Enums.AccountGroup

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.auditLog`: Exposes CRUD operations for the **AuditLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuditLogs
    * const auditLogs = await prisma.auditLog.findMany()
    * ```
    */
  get auditLog(): Prisma.AuditLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.warehouse`: Exposes CRUD operations for the **Warehouse** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Warehouses
    * const warehouses = await prisma.warehouse.findMany()
    * ```
    */
  get warehouse(): Prisma.WarehouseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.outlet`: Exposes CRUD operations for the **Outlet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Outlets
    * const outlets = await prisma.outlet.findMany()
    * ```
    */
  get outlet(): Prisma.OutletDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.category`: Exposes CRUD operations for the **Category** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Categories
    * const categories = await prisma.category.findMany()
    * ```
    */
  get category(): Prisma.CategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.variant`: Exposes CRUD operations for the **Variant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Variants
    * const variants = await prisma.variant.findMany()
    * ```
    */
  get variant(): Prisma.VariantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.stock`: Exposes CRUD operations for the **Stock** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Stocks
    * const stocks = await prisma.stock.findMany()
    * ```
    */
  get stock(): Prisma.StockDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.party`: Exposes CRUD operations for the **Party** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Parties
    * const parties = await prisma.party.findMany()
    * ```
    */
  get party(): Prisma.PartyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Transactions
    * const transactions = await prisma.transaction.findMany()
    * ```
    */
  get transaction(): Prisma.TransactionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transactionItem`: Exposes CRUD operations for the **TransactionItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TransactionItems
    * const transactionItems = await prisma.transactionItem.findMany()
    * ```
    */
  get transactionItem(): Prisma.TransactionItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.account`: Exposes CRUD operations for the **Account** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Accounts
    * const accounts = await prisma.account.findMany()
    * ```
    */
  get account(): Prisma.AccountDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ledgerEntry`: Exposes CRUD operations for the **LedgerEntry** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LedgerEntries
    * const ledgerEntries = await prisma.ledgerEntry.findMany()
    * ```
    */
  get ledgerEntry(): Prisma.LedgerEntryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.vendorProduct`: Exposes CRUD operations for the **VendorProduct** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VendorProducts
    * const vendorProducts = await prisma.vendorProduct.findMany()
    * ```
    */
  get vendorProduct(): Prisma.VendorProductDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.2
   * Query Engine version: 94a226be1cf2967af2541cca5529f0f7ba866919
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    AuditLog: 'AuditLog',
    Warehouse: 'Warehouse',
    Outlet: 'Outlet',
    Category: 'Category',
    Product: 'Product',
    Variant: 'Variant',
    Stock: 'Stock',
    Party: 'Party',
    Transaction: 'Transaction',
    TransactionItem: 'TransactionItem',
    Account: 'Account',
    LedgerEntry: 'LedgerEntry',
    VendorProduct: 'VendorProduct'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "auditLog" | "warehouse" | "outlet" | "category" | "product" | "variant" | "stock" | "party" | "transaction" | "transactionItem" | "account" | "ledgerEntry" | "vendorProduct"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      AuditLog: {
        payload: Prisma.$AuditLogPayload<ExtArgs>
        fields: Prisma.AuditLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuditLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuditLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findFirst: {
            args: Prisma.AuditLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuditLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          findMany: {
            args: Prisma.AuditLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          create: {
            args: Prisma.AuditLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          createMany: {
            args: Prisma.AuditLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuditLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          delete: {
            args: Prisma.AuditLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          update: {
            args: Prisma.AuditLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          deleteMany: {
            args: Prisma.AuditLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuditLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AuditLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>[]
          }
          upsert: {
            args: Prisma.AuditLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuditLogPayload>
          }
          aggregate: {
            args: Prisma.AuditLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuditLog>
          }
          groupBy: {
            args: Prisma.AuditLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuditLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuditLogCountArgs<ExtArgs>
            result: $Utils.Optional<AuditLogCountAggregateOutputType> | number
          }
        }
      }
      Warehouse: {
        payload: Prisma.$WarehousePayload<ExtArgs>
        fields: Prisma.WarehouseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WarehouseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WarehouseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          findFirst: {
            args: Prisma.WarehouseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WarehouseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          findMany: {
            args: Prisma.WarehouseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>[]
          }
          create: {
            args: Prisma.WarehouseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          createMany: {
            args: Prisma.WarehouseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WarehouseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>[]
          }
          delete: {
            args: Prisma.WarehouseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          update: {
            args: Prisma.WarehouseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          deleteMany: {
            args: Prisma.WarehouseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WarehouseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.WarehouseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>[]
          }
          upsert: {
            args: Prisma.WarehouseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          aggregate: {
            args: Prisma.WarehouseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWarehouse>
          }
          groupBy: {
            args: Prisma.WarehouseGroupByArgs<ExtArgs>
            result: $Utils.Optional<WarehouseGroupByOutputType>[]
          }
          count: {
            args: Prisma.WarehouseCountArgs<ExtArgs>
            result: $Utils.Optional<WarehouseCountAggregateOutputType> | number
          }
        }
      }
      Outlet: {
        payload: Prisma.$OutletPayload<ExtArgs>
        fields: Prisma.OutletFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OutletFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OutletFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          findFirst: {
            args: Prisma.OutletFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OutletFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          findMany: {
            args: Prisma.OutletFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>[]
          }
          create: {
            args: Prisma.OutletCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          createMany: {
            args: Prisma.OutletCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OutletCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>[]
          }
          delete: {
            args: Prisma.OutletDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          update: {
            args: Prisma.OutletUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          deleteMany: {
            args: Prisma.OutletDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OutletUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OutletUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>[]
          }
          upsert: {
            args: Prisma.OutletUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OutletPayload>
          }
          aggregate: {
            args: Prisma.OutletAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOutlet>
          }
          groupBy: {
            args: Prisma.OutletGroupByArgs<ExtArgs>
            result: $Utils.Optional<OutletGroupByOutputType>[]
          }
          count: {
            args: Prisma.OutletCountArgs<ExtArgs>
            result: $Utils.Optional<OutletCountAggregateOutputType> | number
          }
        }
      }
      Category: {
        payload: Prisma.$CategoryPayload<ExtArgs>
        fields: Prisma.CategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findFirst: {
            args: Prisma.CategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findMany: {
            args: Prisma.CategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          create: {
            args: Prisma.CategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          createMany: {
            args: Prisma.CategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          delete: {
            args: Prisma.CategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          update: {
            args: Prisma.CategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          deleteMany: {
            args: Prisma.CategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CategoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          upsert: {
            args: Prisma.CategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          aggregate: {
            args: Prisma.CategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategory>
          }
          groupBy: {
            args: Prisma.CategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<CategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.CategoryCountArgs<ExtArgs>
            result: $Utils.Optional<CategoryCountAggregateOutputType> | number
          }
        }
      }
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProductUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      Variant: {
        payload: Prisma.$VariantPayload<ExtArgs>
        fields: Prisma.VariantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VariantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VariantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          findFirst: {
            args: Prisma.VariantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VariantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          findMany: {
            args: Prisma.VariantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>[]
          }
          create: {
            args: Prisma.VariantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          createMany: {
            args: Prisma.VariantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VariantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>[]
          }
          delete: {
            args: Prisma.VariantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          update: {
            args: Prisma.VariantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          deleteMany: {
            args: Prisma.VariantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VariantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VariantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>[]
          }
          upsert: {
            args: Prisma.VariantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VariantPayload>
          }
          aggregate: {
            args: Prisma.VariantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVariant>
          }
          groupBy: {
            args: Prisma.VariantGroupByArgs<ExtArgs>
            result: $Utils.Optional<VariantGroupByOutputType>[]
          }
          count: {
            args: Prisma.VariantCountArgs<ExtArgs>
            result: $Utils.Optional<VariantCountAggregateOutputType> | number
          }
        }
      }
      Stock: {
        payload: Prisma.$StockPayload<ExtArgs>
        fields: Prisma.StockFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StockFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StockFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          findFirst: {
            args: Prisma.StockFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StockFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          findMany: {
            args: Prisma.StockFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>[]
          }
          create: {
            args: Prisma.StockCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          createMany: {
            args: Prisma.StockCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StockCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>[]
          }
          delete: {
            args: Prisma.StockDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          update: {
            args: Prisma.StockUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          deleteMany: {
            args: Prisma.StockDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StockUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StockUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>[]
          }
          upsert: {
            args: Prisma.StockUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StockPayload>
          }
          aggregate: {
            args: Prisma.StockAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStock>
          }
          groupBy: {
            args: Prisma.StockGroupByArgs<ExtArgs>
            result: $Utils.Optional<StockGroupByOutputType>[]
          }
          count: {
            args: Prisma.StockCountArgs<ExtArgs>
            result: $Utils.Optional<StockCountAggregateOutputType> | number
          }
        }
      }
      Party: {
        payload: Prisma.$PartyPayload<ExtArgs>
        fields: Prisma.PartyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PartyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PartyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PartyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PartyPayload>
          }
          findFirst: {
            args: Prisma.PartyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PartyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PartyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PartyPayload>
          }
          findMany: {
            args: Prisma.PartyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PartyPayload>[]
          }
          create: {
            args: Prisma.PartyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PartyPayload>
          }
          createMany: {
            args: Prisma.PartyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PartyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PartyPayload>[]
          }
          delete: {
            args: Prisma.PartyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PartyPayload>
          }
          update: {
            args: Prisma.PartyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PartyPayload>
          }
          deleteMany: {
            args: Prisma.PartyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PartyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PartyUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PartyPayload>[]
          }
          upsert: {
            args: Prisma.PartyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PartyPayload>
          }
          aggregate: {
            args: Prisma.PartyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateParty>
          }
          groupBy: {
            args: Prisma.PartyGroupByArgs<ExtArgs>
            result: $Utils.Optional<PartyGroupByOutputType>[]
          }
          count: {
            args: Prisma.PartyCountArgs<ExtArgs>
            result: $Utils.Optional<PartyCountAggregateOutputType> | number
          }
        }
      }
      Transaction: {
        payload: Prisma.$TransactionPayload<ExtArgs>
        fields: Prisma.TransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findFirst: {
            args: Prisma.TransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findMany: {
            args: Prisma.TransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          create: {
            args: Prisma.TransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          createMany: {
            args: Prisma.TransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          delete: {
            args: Prisma.TransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          update: {
            args: Prisma.TransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          deleteMany: {
            args: Prisma.TransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TransactionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          upsert: {
            args: Prisma.TransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          aggregate: {
            args: Prisma.TransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransaction>
          }
          groupBy: {
            args: Prisma.TransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransactionCountArgs<ExtArgs>
            result: $Utils.Optional<TransactionCountAggregateOutputType> | number
          }
        }
      }
      TransactionItem: {
        payload: Prisma.$TransactionItemPayload<ExtArgs>
        fields: Prisma.TransactionItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransactionItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransactionItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          findFirst: {
            args: Prisma.TransactionItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransactionItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          findMany: {
            args: Prisma.TransactionItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>[]
          }
          create: {
            args: Prisma.TransactionItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          createMany: {
            args: Prisma.TransactionItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransactionItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>[]
          }
          delete: {
            args: Prisma.TransactionItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          update: {
            args: Prisma.TransactionItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          deleteMany: {
            args: Prisma.TransactionItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransactionItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TransactionItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>[]
          }
          upsert: {
            args: Prisma.TransactionItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          aggregate: {
            args: Prisma.TransactionItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransactionItem>
          }
          groupBy: {
            args: Prisma.TransactionItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransactionItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransactionItemCountArgs<ExtArgs>
            result: $Utils.Optional<TransactionItemCountAggregateOutputType> | number
          }
        }
      }
      Account: {
        payload: Prisma.$AccountPayload<ExtArgs>
        fields: Prisma.AccountFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AccountFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AccountFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findFirst: {
            args: Prisma.AccountFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AccountFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          findMany: {
            args: Prisma.AccountFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          create: {
            args: Prisma.AccountCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          createMany: {
            args: Prisma.AccountCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AccountCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          delete: {
            args: Prisma.AccountDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          update: {
            args: Prisma.AccountUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          deleteMany: {
            args: Prisma.AccountDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AccountUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AccountUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>[]
          }
          upsert: {
            args: Prisma.AccountUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AccountPayload>
          }
          aggregate: {
            args: Prisma.AccountAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAccount>
          }
          groupBy: {
            args: Prisma.AccountGroupByArgs<ExtArgs>
            result: $Utils.Optional<AccountGroupByOutputType>[]
          }
          count: {
            args: Prisma.AccountCountArgs<ExtArgs>
            result: $Utils.Optional<AccountCountAggregateOutputType> | number
          }
        }
      }
      LedgerEntry: {
        payload: Prisma.$LedgerEntryPayload<ExtArgs>
        fields: Prisma.LedgerEntryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LedgerEntryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerEntryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LedgerEntryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerEntryPayload>
          }
          findFirst: {
            args: Prisma.LedgerEntryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerEntryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LedgerEntryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerEntryPayload>
          }
          findMany: {
            args: Prisma.LedgerEntryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerEntryPayload>[]
          }
          create: {
            args: Prisma.LedgerEntryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerEntryPayload>
          }
          createMany: {
            args: Prisma.LedgerEntryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LedgerEntryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerEntryPayload>[]
          }
          delete: {
            args: Prisma.LedgerEntryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerEntryPayload>
          }
          update: {
            args: Prisma.LedgerEntryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerEntryPayload>
          }
          deleteMany: {
            args: Prisma.LedgerEntryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LedgerEntryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.LedgerEntryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerEntryPayload>[]
          }
          upsert: {
            args: Prisma.LedgerEntryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LedgerEntryPayload>
          }
          aggregate: {
            args: Prisma.LedgerEntryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLedgerEntry>
          }
          groupBy: {
            args: Prisma.LedgerEntryGroupByArgs<ExtArgs>
            result: $Utils.Optional<LedgerEntryGroupByOutputType>[]
          }
          count: {
            args: Prisma.LedgerEntryCountArgs<ExtArgs>
            result: $Utils.Optional<LedgerEntryCountAggregateOutputType> | number
          }
        }
      }
      VendorProduct: {
        payload: Prisma.$VendorProductPayload<ExtArgs>
        fields: Prisma.VendorProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VendorProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VendorProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VendorProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VendorProductPayload>
          }
          findFirst: {
            args: Prisma.VendorProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VendorProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VendorProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VendorProductPayload>
          }
          findMany: {
            args: Prisma.VendorProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VendorProductPayload>[]
          }
          create: {
            args: Prisma.VendorProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VendorProductPayload>
          }
          createMany: {
            args: Prisma.VendorProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VendorProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VendorProductPayload>[]
          }
          delete: {
            args: Prisma.VendorProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VendorProductPayload>
          }
          update: {
            args: Prisma.VendorProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VendorProductPayload>
          }
          deleteMany: {
            args: Prisma.VendorProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VendorProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VendorProductUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VendorProductPayload>[]
          }
          upsert: {
            args: Prisma.VendorProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VendorProductPayload>
          }
          aggregate: {
            args: Prisma.VendorProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVendorProduct>
          }
          groupBy: {
            args: Prisma.VendorProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<VendorProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.VendorProductCountArgs<ExtArgs>
            result: $Utils.Optional<VendorProductCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    auditLog?: AuditLogOmit
    warehouse?: WarehouseOmit
    outlet?: OutletOmit
    category?: CategoryOmit
    product?: ProductOmit
    variant?: VariantOmit
    stock?: StockOmit
    party?: PartyOmit
    transaction?: TransactionOmit
    transactionItem?: TransactionItemOmit
    account?: AccountOmit
    ledgerEntry?: LedgerEntryOmit
    vendorProduct?: VendorProductOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    outlets: number
    actions: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    outlets?: boolean | UserCountOutputTypeCountOutletsArgs
    actions?: boolean | UserCountOutputTypeCountActionsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountOutletsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutletWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountActionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
  }


  /**
   * Count Type WarehouseCountOutputType
   */

  export type WarehouseCountOutputType = {
    outlets: number
    stocks: number
  }

  export type WarehouseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    outlets?: boolean | WarehouseCountOutputTypeCountOutletsArgs
    stocks?: boolean | WarehouseCountOutputTypeCountStocksArgs
  }

  // Custom InputTypes
  /**
   * WarehouseCountOutputType without action
   */
  export type WarehouseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WarehouseCountOutputType
     */
    select?: WarehouseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * WarehouseCountOutputType without action
   */
  export type WarehouseCountOutputTypeCountOutletsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutletWhereInput
  }

  /**
   * WarehouseCountOutputType without action
   */
  export type WarehouseCountOutputTypeCountStocksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StockWhereInput
  }


  /**
   * Count Type OutletCountOutputType
   */

  export type OutletCountOutputType = {
    warehouses: number
    users: number
    stocks: number
  }

  export type OutletCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    warehouses?: boolean | OutletCountOutputTypeCountWarehousesArgs
    users?: boolean | OutletCountOutputTypeCountUsersArgs
    stocks?: boolean | OutletCountOutputTypeCountStocksArgs
  }

  // Custom InputTypes
  /**
   * OutletCountOutputType without action
   */
  export type OutletCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OutletCountOutputType
     */
    select?: OutletCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OutletCountOutputType without action
   */
  export type OutletCountOutputTypeCountWarehousesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WarehouseWhereInput
  }

  /**
   * OutletCountOutputType without action
   */
  export type OutletCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * OutletCountOutputType without action
   */
  export type OutletCountOutputTypeCountStocksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StockWhereInput
  }


  /**
   * Count Type CategoryCountOutputType
   */

  export type CategoryCountOutputType = {
    children: number
    products: number
  }

  export type CategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | CategoryCountOutputTypeCountChildrenArgs
    products?: boolean | CategoryCountOutputTypeCountProductsArgs
  }

  // Custom InputTypes
  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryCountOutputType
     */
    select?: CategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryWhereInput
  }

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
  }


  /**
   * Count Type ProductCountOutputType
   */

  export type ProductCountOutputType = {
    variants: number
  }

  export type ProductCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    variants?: boolean | ProductCountOutputTypeCountVariantsArgs
  }

  // Custom InputTypes
  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCountOutputType
     */
    select?: ProductCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountVariantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VariantWhereInput
  }


  /**
   * Count Type VariantCountOutputType
   */

  export type VariantCountOutputType = {
    stocks: number
    txnItems: number
    suppliers: number
  }

  export type VariantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stocks?: boolean | VariantCountOutputTypeCountStocksArgs
    txnItems?: boolean | VariantCountOutputTypeCountTxnItemsArgs
    suppliers?: boolean | VariantCountOutputTypeCountSuppliersArgs
  }

  // Custom InputTypes
  /**
   * VariantCountOutputType without action
   */
  export type VariantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VariantCountOutputType
     */
    select?: VariantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VariantCountOutputType without action
   */
  export type VariantCountOutputTypeCountStocksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StockWhereInput
  }

  /**
   * VariantCountOutputType without action
   */
  export type VariantCountOutputTypeCountTxnItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionItemWhereInput
  }

  /**
   * VariantCountOutputType without action
   */
  export type VariantCountOutputTypeCountSuppliersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VendorProductWhereInput
  }


  /**
   * Count Type PartyCountOutputType
   */

  export type PartyCountOutputType = {
    transactions: number
    ledgerEntries: number
    suppliedProducts: number
  }

  export type PartyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transactions?: boolean | PartyCountOutputTypeCountTransactionsArgs
    ledgerEntries?: boolean | PartyCountOutputTypeCountLedgerEntriesArgs
    suppliedProducts?: boolean | PartyCountOutputTypeCountSuppliedProductsArgs
  }

  // Custom InputTypes
  /**
   * PartyCountOutputType without action
   */
  export type PartyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PartyCountOutputType
     */
    select?: PartyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PartyCountOutputType without action
   */
  export type PartyCountOutputTypeCountTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
  }

  /**
   * PartyCountOutputType without action
   */
  export type PartyCountOutputTypeCountLedgerEntriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LedgerEntryWhereInput
  }

  /**
   * PartyCountOutputType without action
   */
  export type PartyCountOutputTypeCountSuppliedProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VendorProductWhereInput
  }


  /**
   * Count Type TransactionCountOutputType
   */

  export type TransactionCountOutputType = {
    children: number
    items: number
    ledgerEntries: number
  }

  export type TransactionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | TransactionCountOutputTypeCountChildrenArgs
    items?: boolean | TransactionCountOutputTypeCountItemsArgs
    ledgerEntries?: boolean | TransactionCountOutputTypeCountLedgerEntriesArgs
  }

  // Custom InputTypes
  /**
   * TransactionCountOutputType without action
   */
  export type TransactionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCountOutputType
     */
    select?: TransactionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TransactionCountOutputType without action
   */
  export type TransactionCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
  }

  /**
   * TransactionCountOutputType without action
   */
  export type TransactionCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionItemWhereInput
  }

  /**
   * TransactionCountOutputType without action
   */
  export type TransactionCountOutputTypeCountLedgerEntriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LedgerEntryWhereInput
  }


  /**
   * Count Type AccountCountOutputType
   */

  export type AccountCountOutputType = {
    entries: number
  }

  export type AccountCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    entries?: boolean | AccountCountOutputTypeCountEntriesArgs
  }

  // Custom InputTypes
  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AccountCountOutputType
     */
    select?: AccountCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AccountCountOutputType without action
   */
  export type AccountCountOutputTypeCountEntriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LedgerEntryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    role: $Enums.Role | null
    password: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    role: $Enums.Role | null
    password: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    role: number
    password: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    role?: true
    password?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    role?: true
    password?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    role?: true
    password?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string
    role: $Enums.Role
    password: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    password?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    outlets?: boolean | User$outletsArgs<ExtArgs>
    actions?: boolean | User$actionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    password?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    password?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    role?: boolean
    password?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "role" | "password" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    outlets?: boolean | User$outletsArgs<ExtArgs>
    actions?: boolean | User$actionsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      outlets: Prisma.$OutletPayload<ExtArgs>[]
      actions: Prisma.$AuditLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string
      role: $Enums.Role
      password: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    outlets<T extends User$outletsArgs<ExtArgs> = {}>(args?: Subset<T, User$outletsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    actions<T extends User$actionsArgs<ExtArgs> = {}>(args?: Subset<T, User$actionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly password: FieldRef<"User", 'String'>
    readonly isActive: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.outlets
   */
  export type User$outletsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    where?: OutletWhereInput
    orderBy?: OutletOrderByWithRelationInput | OutletOrderByWithRelationInput[]
    cursor?: OutletWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OutletScalarFieldEnum | OutletScalarFieldEnum[]
  }

  /**
   * User.actions
   */
  export type User$actionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    cursor?: AuditLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model AuditLog
   */

  export type AggregateAuditLog = {
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  export type AuditLogMinAggregateOutputType = {
    id: string | null
    userId: string | null
    action: string | null
    entity: string | null
    entityId: string | null
    createdAt: Date | null
  }

  export type AuditLogMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    action: string | null
    entity: string | null
    entityId: string | null
    createdAt: Date | null
  }

  export type AuditLogCountAggregateOutputType = {
    id: number
    userId: number
    action: number
    entity: number
    entityId: number
    oldValues: number
    newValues: number
    createdAt: number
    _all: number
  }


  export type AuditLogMinAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    entity?: true
    entityId?: true
    createdAt?: true
  }

  export type AuditLogMaxAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    entity?: true
    entityId?: true
    createdAt?: true
  }

  export type AuditLogCountAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    entity?: true
    entityId?: true
    oldValues?: true
    newValues?: true
    createdAt?: true
    _all?: true
  }

  export type AuditLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLog to aggregate.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuditLogs
    **/
    _count?: true | AuditLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuditLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuditLogMaxAggregateInputType
  }

  export type GetAuditLogAggregateType<T extends AuditLogAggregateArgs> = {
        [P in keyof T & keyof AggregateAuditLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuditLog[P]>
      : GetScalarType<T[P], AggregateAuditLog[P]>
  }




  export type AuditLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuditLogWhereInput
    orderBy?: AuditLogOrderByWithAggregationInput | AuditLogOrderByWithAggregationInput[]
    by: AuditLogScalarFieldEnum[] | AuditLogScalarFieldEnum
    having?: AuditLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuditLogCountAggregateInputType | true
    _min?: AuditLogMinAggregateInputType
    _max?: AuditLogMaxAggregateInputType
  }

  export type AuditLogGroupByOutputType = {
    id: string
    userId: string
    action: string
    entity: string
    entityId: string
    oldValues: JsonValue | null
    newValues: JsonValue | null
    createdAt: Date
    _count: AuditLogCountAggregateOutputType | null
    _min: AuditLogMinAggregateOutputType | null
    _max: AuditLogMaxAggregateOutputType | null
  }

  type GetAuditLogGroupByPayload<T extends AuditLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuditLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuditLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
            : GetScalarType<T[P], AuditLogGroupByOutputType[P]>
        }
      >
    >


  export type AuditLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    oldValues?: boolean
    newValues?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    oldValues?: boolean
    newValues?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    oldValues?: boolean
    newValues?: boolean
    createdAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["auditLog"]>

  export type AuditLogSelectScalar = {
    id?: boolean
    userId?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    oldValues?: boolean
    newValues?: boolean
    createdAt?: boolean
  }

  export type AuditLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "action" | "entity" | "entityId" | "oldValues" | "newValues" | "createdAt", ExtArgs["result"]["auditLog"]>
  export type AuditLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AuditLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AuditLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AuditLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuditLog"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      action: string
      entity: string
      entityId: string
      oldValues: Prisma.JsonValue | null
      newValues: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["auditLog"]>
    composites: {}
  }

  type AuditLogGetPayload<S extends boolean | null | undefined | AuditLogDefaultArgs> = $Result.GetResult<Prisma.$AuditLogPayload, S>

  type AuditLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AuditLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AuditLogCountAggregateInputType | true
    }

  export interface AuditLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuditLog'], meta: { name: 'AuditLog' } }
    /**
     * Find zero or one AuditLog that matches the filter.
     * @param {AuditLogFindUniqueArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuditLogFindUniqueArgs>(args: SelectSubset<T, AuditLogFindUniqueArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AuditLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuditLogFindUniqueOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuditLogFindUniqueOrThrowArgs>(args: SelectSubset<T, AuditLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuditLogFindFirstArgs>(args?: SelectSubset<T, AuditLogFindFirstArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AuditLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindFirstOrThrowArgs} args - Arguments to find a AuditLog
     * @example
     * // Get one AuditLog
     * const auditLog = await prisma.auditLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuditLogFindFirstOrThrowArgs>(args?: SelectSubset<T, AuditLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AuditLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuditLogs
     * const auditLogs = await prisma.auditLog.findMany()
     * 
     * // Get first 10 AuditLogs
     * const auditLogs = await prisma.auditLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuditLogFindManyArgs>(args?: SelectSubset<T, AuditLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AuditLog.
     * @param {AuditLogCreateArgs} args - Arguments to create a AuditLog.
     * @example
     * // Create one AuditLog
     * const AuditLog = await prisma.auditLog.create({
     *   data: {
     *     // ... data to create a AuditLog
     *   }
     * })
     * 
     */
    create<T extends AuditLogCreateArgs>(args: SelectSubset<T, AuditLogCreateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AuditLogs.
     * @param {AuditLogCreateManyArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuditLogCreateManyArgs>(args?: SelectSubset<T, AuditLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuditLogs and returns the data saved in the database.
     * @param {AuditLogCreateManyAndReturnArgs} args - Arguments to create many AuditLogs.
     * @example
     * // Create many AuditLogs
     * const auditLog = await prisma.auditLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuditLogCreateManyAndReturnArgs>(args?: SelectSubset<T, AuditLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AuditLog.
     * @param {AuditLogDeleteArgs} args - Arguments to delete one AuditLog.
     * @example
     * // Delete one AuditLog
     * const AuditLog = await prisma.auditLog.delete({
     *   where: {
     *     // ... filter to delete one AuditLog
     *   }
     * })
     * 
     */
    delete<T extends AuditLogDeleteArgs>(args: SelectSubset<T, AuditLogDeleteArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AuditLog.
     * @param {AuditLogUpdateArgs} args - Arguments to update one AuditLog.
     * @example
     * // Update one AuditLog
     * const auditLog = await prisma.auditLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuditLogUpdateArgs>(args: SelectSubset<T, AuditLogUpdateArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AuditLogs.
     * @param {AuditLogDeleteManyArgs} args - Arguments to filter AuditLogs to delete.
     * @example
     * // Delete a few AuditLogs
     * const { count } = await prisma.auditLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuditLogDeleteManyArgs>(args?: SelectSubset<T, AuditLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuditLogUpdateManyArgs>(args: SelectSubset<T, AuditLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuditLogs and returns the data updated in the database.
     * @param {AuditLogUpdateManyAndReturnArgs} args - Arguments to update many AuditLogs.
     * @example
     * // Update many AuditLogs
     * const auditLog = await prisma.auditLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AuditLogs and only return the `id`
     * const auditLogWithIdOnly = await prisma.auditLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuditLogUpdateManyAndReturnArgs>(args: SelectSubset<T, AuditLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AuditLog.
     * @param {AuditLogUpsertArgs} args - Arguments to update or create a AuditLog.
     * @example
     * // Update or create a AuditLog
     * const auditLog = await prisma.auditLog.upsert({
     *   create: {
     *     // ... data to create a AuditLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuditLog we want to update
     *   }
     * })
     */
    upsert<T extends AuditLogUpsertArgs>(args: SelectSubset<T, AuditLogUpsertArgs<ExtArgs>>): Prisma__AuditLogClient<$Result.GetResult<Prisma.$AuditLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AuditLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogCountArgs} args - Arguments to filter AuditLogs to count.
     * @example
     * // Count the number of AuditLogs
     * const count = await prisma.auditLog.count({
     *   where: {
     *     // ... the filter for the AuditLogs we want to count
     *   }
     * })
    **/
    count<T extends AuditLogCountArgs>(
      args?: Subset<T, AuditLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuditLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuditLogAggregateArgs>(args: Subset<T, AuditLogAggregateArgs>): Prisma.PrismaPromise<GetAuditLogAggregateType<T>>

    /**
     * Group by AuditLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuditLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuditLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuditLogGroupByArgs['orderBy'] }
        : { orderBy?: AuditLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuditLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuditLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuditLog model
   */
  readonly fields: AuditLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuditLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuditLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuditLog model
   */
  interface AuditLogFieldRefs {
    readonly id: FieldRef<"AuditLog", 'String'>
    readonly userId: FieldRef<"AuditLog", 'String'>
    readonly action: FieldRef<"AuditLog", 'String'>
    readonly entity: FieldRef<"AuditLog", 'String'>
    readonly entityId: FieldRef<"AuditLog", 'String'>
    readonly oldValues: FieldRef<"AuditLog", 'Json'>
    readonly newValues: FieldRef<"AuditLog", 'Json'>
    readonly createdAt: FieldRef<"AuditLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuditLog findUnique
   */
  export type AuditLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findUniqueOrThrow
   */
  export type AuditLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog findFirst
   */
  export type AuditLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findFirstOrThrow
   */
  export type AuditLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLog to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuditLogs.
     */
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog findMany
   */
  export type AuditLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter, which AuditLogs to fetch.
     */
    where?: AuditLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuditLogs to fetch.
     */
    orderBy?: AuditLogOrderByWithRelationInput | AuditLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuditLogs.
     */
    cursor?: AuditLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuditLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuditLogs.
     */
    skip?: number
    distinct?: AuditLogScalarFieldEnum | AuditLogScalarFieldEnum[]
  }

  /**
   * AuditLog create
   */
  export type AuditLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to create a AuditLog.
     */
    data: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
  }

  /**
   * AuditLog createMany
   */
  export type AuditLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuditLog createManyAndReturn
   */
  export type AuditLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to create many AuditLogs.
     */
    data: AuditLogCreateManyInput | AuditLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog update
   */
  export type AuditLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The data needed to update a AuditLog.
     */
    data: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
    /**
     * Choose, which AuditLog to update.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog updateMany
   */
  export type AuditLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
  }

  /**
   * AuditLog updateManyAndReturn
   */
  export type AuditLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * The data used to update AuditLogs.
     */
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyInput>
    /**
     * Filter which AuditLogs to update
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuditLog upsert
   */
  export type AuditLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * The filter to search for the AuditLog to update in case it exists.
     */
    where: AuditLogWhereUniqueInput
    /**
     * In case the AuditLog found by the `where` argument doesn't exist, create a new AuditLog with this data.
     */
    create: XOR<AuditLogCreateInput, AuditLogUncheckedCreateInput>
    /**
     * In case the AuditLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuditLogUpdateInput, AuditLogUncheckedUpdateInput>
  }

  /**
   * AuditLog delete
   */
  export type AuditLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
    /**
     * Filter which AuditLog to delete.
     */
    where: AuditLogWhereUniqueInput
  }

  /**
   * AuditLog deleteMany
   */
  export type AuditLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuditLogs to delete
     */
    where?: AuditLogWhereInput
    /**
     * Limit how many AuditLogs to delete.
     */
    limit?: number
  }

  /**
   * AuditLog without action
   */
  export type AuditLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuditLog
     */
    select?: AuditLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AuditLog
     */
    omit?: AuditLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuditLogInclude<ExtArgs> | null
  }


  /**
   * Model Warehouse
   */

  export type AggregateWarehouse = {
    _count: WarehouseCountAggregateOutputType | null
    _min: WarehouseMinAggregateOutputType | null
    _max: WarehouseMaxAggregateOutputType | null
  }

  export type WarehouseMinAggregateOutputType = {
    id: string | null
    name: string | null
    address: string | null
  }

  export type WarehouseMaxAggregateOutputType = {
    id: string | null
    name: string | null
    address: string | null
  }

  export type WarehouseCountAggregateOutputType = {
    id: number
    name: number
    address: number
    _all: number
  }


  export type WarehouseMinAggregateInputType = {
    id?: true
    name?: true
    address?: true
  }

  export type WarehouseMaxAggregateInputType = {
    id?: true
    name?: true
    address?: true
  }

  export type WarehouseCountAggregateInputType = {
    id?: true
    name?: true
    address?: true
    _all?: true
  }

  export type WarehouseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Warehouse to aggregate.
     */
    where?: WarehouseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Warehouses to fetch.
     */
    orderBy?: WarehouseOrderByWithRelationInput | WarehouseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WarehouseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Warehouses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Warehouses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Warehouses
    **/
    _count?: true | WarehouseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WarehouseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WarehouseMaxAggregateInputType
  }

  export type GetWarehouseAggregateType<T extends WarehouseAggregateArgs> = {
        [P in keyof T & keyof AggregateWarehouse]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWarehouse[P]>
      : GetScalarType<T[P], AggregateWarehouse[P]>
  }




  export type WarehouseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WarehouseWhereInput
    orderBy?: WarehouseOrderByWithAggregationInput | WarehouseOrderByWithAggregationInput[]
    by: WarehouseScalarFieldEnum[] | WarehouseScalarFieldEnum
    having?: WarehouseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WarehouseCountAggregateInputType | true
    _min?: WarehouseMinAggregateInputType
    _max?: WarehouseMaxAggregateInputType
  }

  export type WarehouseGroupByOutputType = {
    id: string
    name: string
    address: string | null
    _count: WarehouseCountAggregateOutputType | null
    _min: WarehouseMinAggregateOutputType | null
    _max: WarehouseMaxAggregateOutputType | null
  }

  type GetWarehouseGroupByPayload<T extends WarehouseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WarehouseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WarehouseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WarehouseGroupByOutputType[P]>
            : GetScalarType<T[P], WarehouseGroupByOutputType[P]>
        }
      >
    >


  export type WarehouseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    address?: boolean
    outlets?: boolean | Warehouse$outletsArgs<ExtArgs>
    stocks?: boolean | Warehouse$stocksArgs<ExtArgs>
    _count?: boolean | WarehouseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["warehouse"]>

  export type WarehouseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    address?: boolean
  }, ExtArgs["result"]["warehouse"]>

  export type WarehouseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    address?: boolean
  }, ExtArgs["result"]["warehouse"]>

  export type WarehouseSelectScalar = {
    id?: boolean
    name?: boolean
    address?: boolean
  }

  export type WarehouseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "address", ExtArgs["result"]["warehouse"]>
  export type WarehouseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    outlets?: boolean | Warehouse$outletsArgs<ExtArgs>
    stocks?: boolean | Warehouse$stocksArgs<ExtArgs>
    _count?: boolean | WarehouseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type WarehouseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type WarehouseIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $WarehousePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Warehouse"
    objects: {
      outlets: Prisma.$OutletPayload<ExtArgs>[]
      stocks: Prisma.$StockPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      address: string | null
    }, ExtArgs["result"]["warehouse"]>
    composites: {}
  }

  type WarehouseGetPayload<S extends boolean | null | undefined | WarehouseDefaultArgs> = $Result.GetResult<Prisma.$WarehousePayload, S>

  type WarehouseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<WarehouseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: WarehouseCountAggregateInputType | true
    }

  export interface WarehouseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Warehouse'], meta: { name: 'Warehouse' } }
    /**
     * Find zero or one Warehouse that matches the filter.
     * @param {WarehouseFindUniqueArgs} args - Arguments to find a Warehouse
     * @example
     * // Get one Warehouse
     * const warehouse = await prisma.warehouse.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WarehouseFindUniqueArgs>(args: SelectSubset<T, WarehouseFindUniqueArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Warehouse that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {WarehouseFindUniqueOrThrowArgs} args - Arguments to find a Warehouse
     * @example
     * // Get one Warehouse
     * const warehouse = await prisma.warehouse.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WarehouseFindUniqueOrThrowArgs>(args: SelectSubset<T, WarehouseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Warehouse that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseFindFirstArgs} args - Arguments to find a Warehouse
     * @example
     * // Get one Warehouse
     * const warehouse = await prisma.warehouse.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WarehouseFindFirstArgs>(args?: SelectSubset<T, WarehouseFindFirstArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Warehouse that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseFindFirstOrThrowArgs} args - Arguments to find a Warehouse
     * @example
     * // Get one Warehouse
     * const warehouse = await prisma.warehouse.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WarehouseFindFirstOrThrowArgs>(args?: SelectSubset<T, WarehouseFindFirstOrThrowArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Warehouses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Warehouses
     * const warehouses = await prisma.warehouse.findMany()
     * 
     * // Get first 10 Warehouses
     * const warehouses = await prisma.warehouse.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const warehouseWithIdOnly = await prisma.warehouse.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WarehouseFindManyArgs>(args?: SelectSubset<T, WarehouseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Warehouse.
     * @param {WarehouseCreateArgs} args - Arguments to create a Warehouse.
     * @example
     * // Create one Warehouse
     * const Warehouse = await prisma.warehouse.create({
     *   data: {
     *     // ... data to create a Warehouse
     *   }
     * })
     * 
     */
    create<T extends WarehouseCreateArgs>(args: SelectSubset<T, WarehouseCreateArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Warehouses.
     * @param {WarehouseCreateManyArgs} args - Arguments to create many Warehouses.
     * @example
     * // Create many Warehouses
     * const warehouse = await prisma.warehouse.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WarehouseCreateManyArgs>(args?: SelectSubset<T, WarehouseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Warehouses and returns the data saved in the database.
     * @param {WarehouseCreateManyAndReturnArgs} args - Arguments to create many Warehouses.
     * @example
     * // Create many Warehouses
     * const warehouse = await prisma.warehouse.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Warehouses and only return the `id`
     * const warehouseWithIdOnly = await prisma.warehouse.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WarehouseCreateManyAndReturnArgs>(args?: SelectSubset<T, WarehouseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Warehouse.
     * @param {WarehouseDeleteArgs} args - Arguments to delete one Warehouse.
     * @example
     * // Delete one Warehouse
     * const Warehouse = await prisma.warehouse.delete({
     *   where: {
     *     // ... filter to delete one Warehouse
     *   }
     * })
     * 
     */
    delete<T extends WarehouseDeleteArgs>(args: SelectSubset<T, WarehouseDeleteArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Warehouse.
     * @param {WarehouseUpdateArgs} args - Arguments to update one Warehouse.
     * @example
     * // Update one Warehouse
     * const warehouse = await prisma.warehouse.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WarehouseUpdateArgs>(args: SelectSubset<T, WarehouseUpdateArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Warehouses.
     * @param {WarehouseDeleteManyArgs} args - Arguments to filter Warehouses to delete.
     * @example
     * // Delete a few Warehouses
     * const { count } = await prisma.warehouse.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WarehouseDeleteManyArgs>(args?: SelectSubset<T, WarehouseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Warehouses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Warehouses
     * const warehouse = await prisma.warehouse.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WarehouseUpdateManyArgs>(args: SelectSubset<T, WarehouseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Warehouses and returns the data updated in the database.
     * @param {WarehouseUpdateManyAndReturnArgs} args - Arguments to update many Warehouses.
     * @example
     * // Update many Warehouses
     * const warehouse = await prisma.warehouse.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Warehouses and only return the `id`
     * const warehouseWithIdOnly = await prisma.warehouse.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends WarehouseUpdateManyAndReturnArgs>(args: SelectSubset<T, WarehouseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Warehouse.
     * @param {WarehouseUpsertArgs} args - Arguments to update or create a Warehouse.
     * @example
     * // Update or create a Warehouse
     * const warehouse = await prisma.warehouse.upsert({
     *   create: {
     *     // ... data to create a Warehouse
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Warehouse we want to update
     *   }
     * })
     */
    upsert<T extends WarehouseUpsertArgs>(args: SelectSubset<T, WarehouseUpsertArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Warehouses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseCountArgs} args - Arguments to filter Warehouses to count.
     * @example
     * // Count the number of Warehouses
     * const count = await prisma.warehouse.count({
     *   where: {
     *     // ... the filter for the Warehouses we want to count
     *   }
     * })
    **/
    count<T extends WarehouseCountArgs>(
      args?: Subset<T, WarehouseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WarehouseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Warehouse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WarehouseAggregateArgs>(args: Subset<T, WarehouseAggregateArgs>): Prisma.PrismaPromise<GetWarehouseAggregateType<T>>

    /**
     * Group by Warehouse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WarehouseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WarehouseGroupByArgs['orderBy'] }
        : { orderBy?: WarehouseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WarehouseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWarehouseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Warehouse model
   */
  readonly fields: WarehouseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Warehouse.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WarehouseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    outlets<T extends Warehouse$outletsArgs<ExtArgs> = {}>(args?: Subset<T, Warehouse$outletsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    stocks<T extends Warehouse$stocksArgs<ExtArgs> = {}>(args?: Subset<T, Warehouse$stocksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Warehouse model
   */
  interface WarehouseFieldRefs {
    readonly id: FieldRef<"Warehouse", 'String'>
    readonly name: FieldRef<"Warehouse", 'String'>
    readonly address: FieldRef<"Warehouse", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Warehouse findUnique
   */
  export type WarehouseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter, which Warehouse to fetch.
     */
    where: WarehouseWhereUniqueInput
  }

  /**
   * Warehouse findUniqueOrThrow
   */
  export type WarehouseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter, which Warehouse to fetch.
     */
    where: WarehouseWhereUniqueInput
  }

  /**
   * Warehouse findFirst
   */
  export type WarehouseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter, which Warehouse to fetch.
     */
    where?: WarehouseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Warehouses to fetch.
     */
    orderBy?: WarehouseOrderByWithRelationInput | WarehouseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Warehouses.
     */
    cursor?: WarehouseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Warehouses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Warehouses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Warehouses.
     */
    distinct?: WarehouseScalarFieldEnum | WarehouseScalarFieldEnum[]
  }

  /**
   * Warehouse findFirstOrThrow
   */
  export type WarehouseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter, which Warehouse to fetch.
     */
    where?: WarehouseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Warehouses to fetch.
     */
    orderBy?: WarehouseOrderByWithRelationInput | WarehouseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Warehouses.
     */
    cursor?: WarehouseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Warehouses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Warehouses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Warehouses.
     */
    distinct?: WarehouseScalarFieldEnum | WarehouseScalarFieldEnum[]
  }

  /**
   * Warehouse findMany
   */
  export type WarehouseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter, which Warehouses to fetch.
     */
    where?: WarehouseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Warehouses to fetch.
     */
    orderBy?: WarehouseOrderByWithRelationInput | WarehouseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Warehouses.
     */
    cursor?: WarehouseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Warehouses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Warehouses.
     */
    skip?: number
    distinct?: WarehouseScalarFieldEnum | WarehouseScalarFieldEnum[]
  }

  /**
   * Warehouse create
   */
  export type WarehouseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * The data needed to create a Warehouse.
     */
    data: XOR<WarehouseCreateInput, WarehouseUncheckedCreateInput>
  }

  /**
   * Warehouse createMany
   */
  export type WarehouseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Warehouses.
     */
    data: WarehouseCreateManyInput | WarehouseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Warehouse createManyAndReturn
   */
  export type WarehouseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * The data used to create many Warehouses.
     */
    data: WarehouseCreateManyInput | WarehouseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Warehouse update
   */
  export type WarehouseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * The data needed to update a Warehouse.
     */
    data: XOR<WarehouseUpdateInput, WarehouseUncheckedUpdateInput>
    /**
     * Choose, which Warehouse to update.
     */
    where: WarehouseWhereUniqueInput
  }

  /**
   * Warehouse updateMany
   */
  export type WarehouseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Warehouses.
     */
    data: XOR<WarehouseUpdateManyMutationInput, WarehouseUncheckedUpdateManyInput>
    /**
     * Filter which Warehouses to update
     */
    where?: WarehouseWhereInput
    /**
     * Limit how many Warehouses to update.
     */
    limit?: number
  }

  /**
   * Warehouse updateManyAndReturn
   */
  export type WarehouseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * The data used to update Warehouses.
     */
    data: XOR<WarehouseUpdateManyMutationInput, WarehouseUncheckedUpdateManyInput>
    /**
     * Filter which Warehouses to update
     */
    where?: WarehouseWhereInput
    /**
     * Limit how many Warehouses to update.
     */
    limit?: number
  }

  /**
   * Warehouse upsert
   */
  export type WarehouseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * The filter to search for the Warehouse to update in case it exists.
     */
    where: WarehouseWhereUniqueInput
    /**
     * In case the Warehouse found by the `where` argument doesn't exist, create a new Warehouse with this data.
     */
    create: XOR<WarehouseCreateInput, WarehouseUncheckedCreateInput>
    /**
     * In case the Warehouse was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WarehouseUpdateInput, WarehouseUncheckedUpdateInput>
  }

  /**
   * Warehouse delete
   */
  export type WarehouseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter which Warehouse to delete.
     */
    where: WarehouseWhereUniqueInput
  }

  /**
   * Warehouse deleteMany
   */
  export type WarehouseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Warehouses to delete
     */
    where?: WarehouseWhereInput
    /**
     * Limit how many Warehouses to delete.
     */
    limit?: number
  }

  /**
   * Warehouse.outlets
   */
  export type Warehouse$outletsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    where?: OutletWhereInput
    orderBy?: OutletOrderByWithRelationInput | OutletOrderByWithRelationInput[]
    cursor?: OutletWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OutletScalarFieldEnum | OutletScalarFieldEnum[]
  }

  /**
   * Warehouse.stocks
   */
  export type Warehouse$stocksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    where?: StockWhereInput
    orderBy?: StockOrderByWithRelationInput | StockOrderByWithRelationInput[]
    cursor?: StockWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StockScalarFieldEnum | StockScalarFieldEnum[]
  }

  /**
   * Warehouse without action
   */
  export type WarehouseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
  }


  /**
   * Model Outlet
   */

  export type AggregateOutlet = {
    _count: OutletCountAggregateOutputType | null
    _min: OutletMinAggregateOutputType | null
    _max: OutletMaxAggregateOutputType | null
  }

  export type OutletMinAggregateOutputType = {
    id: string | null
    name: string | null
    invoicePrefix: string | null
    gstin: string | null
    bankDetails: string | null
    negativeStockPolicy: string | null
  }

  export type OutletMaxAggregateOutputType = {
    id: string | null
    name: string | null
    invoicePrefix: string | null
    gstin: string | null
    bankDetails: string | null
    negativeStockPolicy: string | null
  }

  export type OutletCountAggregateOutputType = {
    id: number
    name: number
    invoicePrefix: number
    gstin: number
    bankDetails: number
    negativeStockPolicy: number
    _all: number
  }


  export type OutletMinAggregateInputType = {
    id?: true
    name?: true
    invoicePrefix?: true
    gstin?: true
    bankDetails?: true
    negativeStockPolicy?: true
  }

  export type OutletMaxAggregateInputType = {
    id?: true
    name?: true
    invoicePrefix?: true
    gstin?: true
    bankDetails?: true
    negativeStockPolicy?: true
  }

  export type OutletCountAggregateInputType = {
    id?: true
    name?: true
    invoicePrefix?: true
    gstin?: true
    bankDetails?: true
    negativeStockPolicy?: true
    _all?: true
  }

  export type OutletAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Outlet to aggregate.
     */
    where?: OutletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outlets to fetch.
     */
    orderBy?: OutletOrderByWithRelationInput | OutletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OutletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outlets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outlets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Outlets
    **/
    _count?: true | OutletCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OutletMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OutletMaxAggregateInputType
  }

  export type GetOutletAggregateType<T extends OutletAggregateArgs> = {
        [P in keyof T & keyof AggregateOutlet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOutlet[P]>
      : GetScalarType<T[P], AggregateOutlet[P]>
  }




  export type OutletGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OutletWhereInput
    orderBy?: OutletOrderByWithAggregationInput | OutletOrderByWithAggregationInput[]
    by: OutletScalarFieldEnum[] | OutletScalarFieldEnum
    having?: OutletScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OutletCountAggregateInputType | true
    _min?: OutletMinAggregateInputType
    _max?: OutletMaxAggregateInputType
  }

  export type OutletGroupByOutputType = {
    id: string
    name: string
    invoicePrefix: string
    gstin: string | null
    bankDetails: string | null
    negativeStockPolicy: string
    _count: OutletCountAggregateOutputType | null
    _min: OutletMinAggregateOutputType | null
    _max: OutletMaxAggregateOutputType | null
  }

  type GetOutletGroupByPayload<T extends OutletGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OutletGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OutletGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OutletGroupByOutputType[P]>
            : GetScalarType<T[P], OutletGroupByOutputType[P]>
        }
      >
    >


  export type OutletSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    invoicePrefix?: boolean
    gstin?: boolean
    bankDetails?: boolean
    negativeStockPolicy?: boolean
    warehouses?: boolean | Outlet$warehousesArgs<ExtArgs>
    users?: boolean | Outlet$usersArgs<ExtArgs>
    stocks?: boolean | Outlet$stocksArgs<ExtArgs>
    _count?: boolean | OutletCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["outlet"]>

  export type OutletSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    invoicePrefix?: boolean
    gstin?: boolean
    bankDetails?: boolean
    negativeStockPolicy?: boolean
  }, ExtArgs["result"]["outlet"]>

  export type OutletSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    invoicePrefix?: boolean
    gstin?: boolean
    bankDetails?: boolean
    negativeStockPolicy?: boolean
  }, ExtArgs["result"]["outlet"]>

  export type OutletSelectScalar = {
    id?: boolean
    name?: boolean
    invoicePrefix?: boolean
    gstin?: boolean
    bankDetails?: boolean
    negativeStockPolicy?: boolean
  }

  export type OutletOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "invoicePrefix" | "gstin" | "bankDetails" | "negativeStockPolicy", ExtArgs["result"]["outlet"]>
  export type OutletInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    warehouses?: boolean | Outlet$warehousesArgs<ExtArgs>
    users?: boolean | Outlet$usersArgs<ExtArgs>
    stocks?: boolean | Outlet$stocksArgs<ExtArgs>
    _count?: boolean | OutletCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OutletIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OutletIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OutletPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Outlet"
    objects: {
      warehouses: Prisma.$WarehousePayload<ExtArgs>[]
      users: Prisma.$UserPayload<ExtArgs>[]
      stocks: Prisma.$StockPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      invoicePrefix: string
      gstin: string | null
      bankDetails: string | null
      negativeStockPolicy: string
    }, ExtArgs["result"]["outlet"]>
    composites: {}
  }

  type OutletGetPayload<S extends boolean | null | undefined | OutletDefaultArgs> = $Result.GetResult<Prisma.$OutletPayload, S>

  type OutletCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OutletFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OutletCountAggregateInputType | true
    }

  export interface OutletDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Outlet'], meta: { name: 'Outlet' } }
    /**
     * Find zero or one Outlet that matches the filter.
     * @param {OutletFindUniqueArgs} args - Arguments to find a Outlet
     * @example
     * // Get one Outlet
     * const outlet = await prisma.outlet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OutletFindUniqueArgs>(args: SelectSubset<T, OutletFindUniqueArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Outlet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OutletFindUniqueOrThrowArgs} args - Arguments to find a Outlet
     * @example
     * // Get one Outlet
     * const outlet = await prisma.outlet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OutletFindUniqueOrThrowArgs>(args: SelectSubset<T, OutletFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Outlet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletFindFirstArgs} args - Arguments to find a Outlet
     * @example
     * // Get one Outlet
     * const outlet = await prisma.outlet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OutletFindFirstArgs>(args?: SelectSubset<T, OutletFindFirstArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Outlet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletFindFirstOrThrowArgs} args - Arguments to find a Outlet
     * @example
     * // Get one Outlet
     * const outlet = await prisma.outlet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OutletFindFirstOrThrowArgs>(args?: SelectSubset<T, OutletFindFirstOrThrowArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Outlets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Outlets
     * const outlets = await prisma.outlet.findMany()
     * 
     * // Get first 10 Outlets
     * const outlets = await prisma.outlet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const outletWithIdOnly = await prisma.outlet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OutletFindManyArgs>(args?: SelectSubset<T, OutletFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Outlet.
     * @param {OutletCreateArgs} args - Arguments to create a Outlet.
     * @example
     * // Create one Outlet
     * const Outlet = await prisma.outlet.create({
     *   data: {
     *     // ... data to create a Outlet
     *   }
     * })
     * 
     */
    create<T extends OutletCreateArgs>(args: SelectSubset<T, OutletCreateArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Outlets.
     * @param {OutletCreateManyArgs} args - Arguments to create many Outlets.
     * @example
     * // Create many Outlets
     * const outlet = await prisma.outlet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OutletCreateManyArgs>(args?: SelectSubset<T, OutletCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Outlets and returns the data saved in the database.
     * @param {OutletCreateManyAndReturnArgs} args - Arguments to create many Outlets.
     * @example
     * // Create many Outlets
     * const outlet = await prisma.outlet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Outlets and only return the `id`
     * const outletWithIdOnly = await prisma.outlet.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OutletCreateManyAndReturnArgs>(args?: SelectSubset<T, OutletCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Outlet.
     * @param {OutletDeleteArgs} args - Arguments to delete one Outlet.
     * @example
     * // Delete one Outlet
     * const Outlet = await prisma.outlet.delete({
     *   where: {
     *     // ... filter to delete one Outlet
     *   }
     * })
     * 
     */
    delete<T extends OutletDeleteArgs>(args: SelectSubset<T, OutletDeleteArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Outlet.
     * @param {OutletUpdateArgs} args - Arguments to update one Outlet.
     * @example
     * // Update one Outlet
     * const outlet = await prisma.outlet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OutletUpdateArgs>(args: SelectSubset<T, OutletUpdateArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Outlets.
     * @param {OutletDeleteManyArgs} args - Arguments to filter Outlets to delete.
     * @example
     * // Delete a few Outlets
     * const { count } = await prisma.outlet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OutletDeleteManyArgs>(args?: SelectSubset<T, OutletDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Outlets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Outlets
     * const outlet = await prisma.outlet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OutletUpdateManyArgs>(args: SelectSubset<T, OutletUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Outlets and returns the data updated in the database.
     * @param {OutletUpdateManyAndReturnArgs} args - Arguments to update many Outlets.
     * @example
     * // Update many Outlets
     * const outlet = await prisma.outlet.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Outlets and only return the `id`
     * const outletWithIdOnly = await prisma.outlet.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OutletUpdateManyAndReturnArgs>(args: SelectSubset<T, OutletUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Outlet.
     * @param {OutletUpsertArgs} args - Arguments to update or create a Outlet.
     * @example
     * // Update or create a Outlet
     * const outlet = await prisma.outlet.upsert({
     *   create: {
     *     // ... data to create a Outlet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Outlet we want to update
     *   }
     * })
     */
    upsert<T extends OutletUpsertArgs>(args: SelectSubset<T, OutletUpsertArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Outlets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletCountArgs} args - Arguments to filter Outlets to count.
     * @example
     * // Count the number of Outlets
     * const count = await prisma.outlet.count({
     *   where: {
     *     // ... the filter for the Outlets we want to count
     *   }
     * })
    **/
    count<T extends OutletCountArgs>(
      args?: Subset<T, OutletCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OutletCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Outlet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OutletAggregateArgs>(args: Subset<T, OutletAggregateArgs>): Prisma.PrismaPromise<GetOutletAggregateType<T>>

    /**
     * Group by Outlet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OutletGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OutletGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OutletGroupByArgs['orderBy'] }
        : { orderBy?: OutletGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OutletGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOutletGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Outlet model
   */
  readonly fields: OutletFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Outlet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OutletClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    warehouses<T extends Outlet$warehousesArgs<ExtArgs> = {}>(args?: Subset<T, Outlet$warehousesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    users<T extends Outlet$usersArgs<ExtArgs> = {}>(args?: Subset<T, Outlet$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    stocks<T extends Outlet$stocksArgs<ExtArgs> = {}>(args?: Subset<T, Outlet$stocksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Outlet model
   */
  interface OutletFieldRefs {
    readonly id: FieldRef<"Outlet", 'String'>
    readonly name: FieldRef<"Outlet", 'String'>
    readonly invoicePrefix: FieldRef<"Outlet", 'String'>
    readonly gstin: FieldRef<"Outlet", 'String'>
    readonly bankDetails: FieldRef<"Outlet", 'String'>
    readonly negativeStockPolicy: FieldRef<"Outlet", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Outlet findUnique
   */
  export type OutletFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter, which Outlet to fetch.
     */
    where: OutletWhereUniqueInput
  }

  /**
   * Outlet findUniqueOrThrow
   */
  export type OutletFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter, which Outlet to fetch.
     */
    where: OutletWhereUniqueInput
  }

  /**
   * Outlet findFirst
   */
  export type OutletFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter, which Outlet to fetch.
     */
    where?: OutletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outlets to fetch.
     */
    orderBy?: OutletOrderByWithRelationInput | OutletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Outlets.
     */
    cursor?: OutletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outlets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outlets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Outlets.
     */
    distinct?: OutletScalarFieldEnum | OutletScalarFieldEnum[]
  }

  /**
   * Outlet findFirstOrThrow
   */
  export type OutletFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter, which Outlet to fetch.
     */
    where?: OutletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outlets to fetch.
     */
    orderBy?: OutletOrderByWithRelationInput | OutletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Outlets.
     */
    cursor?: OutletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outlets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outlets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Outlets.
     */
    distinct?: OutletScalarFieldEnum | OutletScalarFieldEnum[]
  }

  /**
   * Outlet findMany
   */
  export type OutletFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter, which Outlets to fetch.
     */
    where?: OutletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Outlets to fetch.
     */
    orderBy?: OutletOrderByWithRelationInput | OutletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Outlets.
     */
    cursor?: OutletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Outlets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Outlets.
     */
    skip?: number
    distinct?: OutletScalarFieldEnum | OutletScalarFieldEnum[]
  }

  /**
   * Outlet create
   */
  export type OutletCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * The data needed to create a Outlet.
     */
    data: XOR<OutletCreateInput, OutletUncheckedCreateInput>
  }

  /**
   * Outlet createMany
   */
  export type OutletCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Outlets.
     */
    data: OutletCreateManyInput | OutletCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Outlet createManyAndReturn
   */
  export type OutletCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * The data used to create many Outlets.
     */
    data: OutletCreateManyInput | OutletCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Outlet update
   */
  export type OutletUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * The data needed to update a Outlet.
     */
    data: XOR<OutletUpdateInput, OutletUncheckedUpdateInput>
    /**
     * Choose, which Outlet to update.
     */
    where: OutletWhereUniqueInput
  }

  /**
   * Outlet updateMany
   */
  export type OutletUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Outlets.
     */
    data: XOR<OutletUpdateManyMutationInput, OutletUncheckedUpdateManyInput>
    /**
     * Filter which Outlets to update
     */
    where?: OutletWhereInput
    /**
     * Limit how many Outlets to update.
     */
    limit?: number
  }

  /**
   * Outlet updateManyAndReturn
   */
  export type OutletUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * The data used to update Outlets.
     */
    data: XOR<OutletUpdateManyMutationInput, OutletUncheckedUpdateManyInput>
    /**
     * Filter which Outlets to update
     */
    where?: OutletWhereInput
    /**
     * Limit how many Outlets to update.
     */
    limit?: number
  }

  /**
   * Outlet upsert
   */
  export type OutletUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * The filter to search for the Outlet to update in case it exists.
     */
    where: OutletWhereUniqueInput
    /**
     * In case the Outlet found by the `where` argument doesn't exist, create a new Outlet with this data.
     */
    create: XOR<OutletCreateInput, OutletUncheckedCreateInput>
    /**
     * In case the Outlet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OutletUpdateInput, OutletUncheckedUpdateInput>
  }

  /**
   * Outlet delete
   */
  export type OutletDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    /**
     * Filter which Outlet to delete.
     */
    where: OutletWhereUniqueInput
  }

  /**
   * Outlet deleteMany
   */
  export type OutletDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Outlets to delete
     */
    where?: OutletWhereInput
    /**
     * Limit how many Outlets to delete.
     */
    limit?: number
  }

  /**
   * Outlet.warehouses
   */
  export type Outlet$warehousesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    where?: WarehouseWhereInput
    orderBy?: WarehouseOrderByWithRelationInput | WarehouseOrderByWithRelationInput[]
    cursor?: WarehouseWhereUniqueInput
    take?: number
    skip?: number
    distinct?: WarehouseScalarFieldEnum | WarehouseScalarFieldEnum[]
  }

  /**
   * Outlet.users
   */
  export type Outlet$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Outlet.stocks
   */
  export type Outlet$stocksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    where?: StockWhereInput
    orderBy?: StockOrderByWithRelationInput | StockOrderByWithRelationInput[]
    cursor?: StockWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StockScalarFieldEnum | StockScalarFieldEnum[]
  }

  /**
   * Outlet without action
   */
  export type OutletDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
  }


  /**
   * Model Category
   */

  export type AggregateCategory = {
    _count: CategoryCountAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  export type CategoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    parentId: string | null
  }

  export type CategoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    parentId: string | null
  }

  export type CategoryCountAggregateOutputType = {
    id: number
    name: number
    parentId: number
    _all: number
  }


  export type CategoryMinAggregateInputType = {
    id?: true
    name?: true
    parentId?: true
  }

  export type CategoryMaxAggregateInputType = {
    id?: true
    name?: true
    parentId?: true
  }

  export type CategoryCountAggregateInputType = {
    id?: true
    name?: true
    parentId?: true
    _all?: true
  }

  export type CategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Category to aggregate.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Categories
    **/
    _count?: true | CategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CategoryMaxAggregateInputType
  }

  export type GetCategoryAggregateType<T extends CategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategory[P]>
      : GetScalarType<T[P], AggregateCategory[P]>
  }




  export type CategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryWhereInput
    orderBy?: CategoryOrderByWithAggregationInput | CategoryOrderByWithAggregationInput[]
    by: CategoryScalarFieldEnum[] | CategoryScalarFieldEnum
    having?: CategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CategoryCountAggregateInputType | true
    _min?: CategoryMinAggregateInputType
    _max?: CategoryMaxAggregateInputType
  }

  export type CategoryGroupByOutputType = {
    id: string
    name: string
    parentId: string | null
    _count: CategoryCountAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  type GetCategoryGroupByPayload<T extends CategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoryGroupByOutputType[P]>
            : GetScalarType<T[P], CategoryGroupByOutputType[P]>
        }
      >
    >


  export type CategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    parentId?: boolean
    parent?: boolean | Category$parentArgs<ExtArgs>
    children?: boolean | Category$childrenArgs<ExtArgs>
    products?: boolean | Category$productsArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["category"]>

  export type CategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    parentId?: boolean
    parent?: boolean | Category$parentArgs<ExtArgs>
  }, ExtArgs["result"]["category"]>

  export type CategorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    parentId?: boolean
    parent?: boolean | Category$parentArgs<ExtArgs>
  }, ExtArgs["result"]["category"]>

  export type CategorySelectScalar = {
    id?: boolean
    name?: boolean
    parentId?: boolean
  }

  export type CategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "parentId", ExtArgs["result"]["category"]>
  export type CategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Category$parentArgs<ExtArgs>
    children?: boolean | Category$childrenArgs<ExtArgs>
    products?: boolean | Category$productsArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Category$parentArgs<ExtArgs>
  }
  export type CategoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | Category$parentArgs<ExtArgs>
  }

  export type $CategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Category"
    objects: {
      parent: Prisma.$CategoryPayload<ExtArgs> | null
      children: Prisma.$CategoryPayload<ExtArgs>[]
      products: Prisma.$ProductPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      parentId: string | null
    }, ExtArgs["result"]["category"]>
    composites: {}
  }

  type CategoryGetPayload<S extends boolean | null | undefined | CategoryDefaultArgs> = $Result.GetResult<Prisma.$CategoryPayload, S>

  type CategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CategoryCountAggregateInputType | true
    }

  export interface CategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Category'], meta: { name: 'Category' } }
    /**
     * Find zero or one Category that matches the filter.
     * @param {CategoryFindUniqueArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategoryFindUniqueArgs>(args: SelectSubset<T, CategoryFindUniqueArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Category that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CategoryFindUniqueOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, CategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategoryFindFirstArgs>(args?: SelectSubset<T, CategoryFindFirstArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, CategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Categories
     * const categories = await prisma.category.findMany()
     * 
     * // Get first 10 Categories
     * const categories = await prisma.category.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const categoryWithIdOnly = await prisma.category.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CategoryFindManyArgs>(args?: SelectSubset<T, CategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Category.
     * @param {CategoryCreateArgs} args - Arguments to create a Category.
     * @example
     * // Create one Category
     * const Category = await prisma.category.create({
     *   data: {
     *     // ... data to create a Category
     *   }
     * })
     * 
     */
    create<T extends CategoryCreateArgs>(args: SelectSubset<T, CategoryCreateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Categories.
     * @param {CategoryCreateManyArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CategoryCreateManyArgs>(args?: SelectSubset<T, CategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Categories and returns the data saved in the database.
     * @param {CategoryCreateManyAndReturnArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Categories and only return the `id`
     * const categoryWithIdOnly = await prisma.category.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, CategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Category.
     * @param {CategoryDeleteArgs} args - Arguments to delete one Category.
     * @example
     * // Delete one Category
     * const Category = await prisma.category.delete({
     *   where: {
     *     // ... filter to delete one Category
     *   }
     * })
     * 
     */
    delete<T extends CategoryDeleteArgs>(args: SelectSubset<T, CategoryDeleteArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Category.
     * @param {CategoryUpdateArgs} args - Arguments to update one Category.
     * @example
     * // Update one Category
     * const category = await prisma.category.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CategoryUpdateArgs>(args: SelectSubset<T, CategoryUpdateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Categories.
     * @param {CategoryDeleteManyArgs} args - Arguments to filter Categories to delete.
     * @example
     * // Delete a few Categories
     * const { count } = await prisma.category.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CategoryDeleteManyArgs>(args?: SelectSubset<T, CategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CategoryUpdateManyArgs>(args: SelectSubset<T, CategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories and returns the data updated in the database.
     * @param {CategoryUpdateManyAndReturnArgs} args - Arguments to update many Categories.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Categories and only return the `id`
     * const categoryWithIdOnly = await prisma.category.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CategoryUpdateManyAndReturnArgs>(args: SelectSubset<T, CategoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Category.
     * @param {CategoryUpsertArgs} args - Arguments to update or create a Category.
     * @example
     * // Update or create a Category
     * const category = await prisma.category.upsert({
     *   create: {
     *     // ... data to create a Category
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Category we want to update
     *   }
     * })
     */
    upsert<T extends CategoryUpsertArgs>(args: SelectSubset<T, CategoryUpsertArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryCountArgs} args - Arguments to filter Categories to count.
     * @example
     * // Count the number of Categories
     * const count = await prisma.category.count({
     *   where: {
     *     // ... the filter for the Categories we want to count
     *   }
     * })
    **/
    count<T extends CategoryCountArgs>(
      args?: Subset<T, CategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CategoryAggregateArgs>(args: Subset<T, CategoryAggregateArgs>): Prisma.PrismaPromise<GetCategoryAggregateType<T>>

    /**
     * Group by Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategoryGroupByArgs['orderBy'] }
        : { orderBy?: CategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Category model
   */
  readonly fields: CategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Category.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parent<T extends Category$parentArgs<ExtArgs> = {}>(args?: Subset<T, Category$parentArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    children<T extends Category$childrenArgs<ExtArgs> = {}>(args?: Subset<T, Category$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    products<T extends Category$productsArgs<ExtArgs> = {}>(args?: Subset<T, Category$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Category model
   */
  interface CategoryFieldRefs {
    readonly id: FieldRef<"Category", 'String'>
    readonly name: FieldRef<"Category", 'String'>
    readonly parentId: FieldRef<"Category", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Category findUnique
   */
  export type CategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findUniqueOrThrow
   */
  export type CategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findFirst
   */
  export type CategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findFirstOrThrow
   */
  export type CategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findMany
   */
  export type CategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category create
   */
  export type CategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Category.
     */
    data: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
  }

  /**
   * Category createMany
   */
  export type CategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Category createManyAndReturn
   */
  export type CategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Category update
   */
  export type CategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Category.
     */
    data: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
    /**
     * Choose, which Category to update.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category updateMany
   */
  export type CategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to update.
     */
    limit?: number
  }

  /**
   * Category updateManyAndReturn
   */
  export type CategoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Category upsert
   */
  export type CategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Category to update in case it exists.
     */
    where: CategoryWhereUniqueInput
    /**
     * In case the Category found by the `where` argument doesn't exist, create a new Category with this data.
     */
    create: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
    /**
     * In case the Category was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
  }

  /**
   * Category delete
   */
  export type CategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter which Category to delete.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category deleteMany
   */
  export type CategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Categories to delete
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to delete.
     */
    limit?: number
  }

  /**
   * Category.parent
   */
  export type Category$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    where?: CategoryWhereInput
  }

  /**
   * Category.children
   */
  export type Category$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    where?: CategoryWhereInput
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    cursor?: CategoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category.products
   */
  export type Category$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    cursor?: ProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Category without action
   */
  export type CategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
  }


  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    gstRate: number | null
    conversionRatio: number | null
  }

  export type ProductSumAggregateOutputType = {
    gstRate: number | null
    conversionRatio: number | null
  }

  export type ProductMinAggregateOutputType = {
    id: string | null
    name: string | null
    brand: string | null
    hsnCode: string | null
    gstRate: number | null
    baseUnit: string | null
    purchaseUnit: string | null
    salesUnit: string | null
    conversionRatio: number | null
    categoryId: string | null
    isArchived: boolean | null
  }

  export type ProductMaxAggregateOutputType = {
    id: string | null
    name: string | null
    brand: string | null
    hsnCode: string | null
    gstRate: number | null
    baseUnit: string | null
    purchaseUnit: string | null
    salesUnit: string | null
    conversionRatio: number | null
    categoryId: string | null
    isArchived: boolean | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    name: number
    brand: number
    hsnCode: number
    gstRate: number
    baseUnit: number
    purchaseUnit: number
    salesUnit: number
    conversionRatio: number
    categoryId: number
    isArchived: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    gstRate?: true
    conversionRatio?: true
  }

  export type ProductSumAggregateInputType = {
    gstRate?: true
    conversionRatio?: true
  }

  export type ProductMinAggregateInputType = {
    id?: true
    name?: true
    brand?: true
    hsnCode?: true
    gstRate?: true
    baseUnit?: true
    purchaseUnit?: true
    salesUnit?: true
    conversionRatio?: true
    categoryId?: true
    isArchived?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    name?: true
    brand?: true
    hsnCode?: true
    gstRate?: true
    baseUnit?: true
    purchaseUnit?: true
    salesUnit?: true
    conversionRatio?: true
    categoryId?: true
    isArchived?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    name?: true
    brand?: true
    hsnCode?: true
    gstRate?: true
    baseUnit?: true
    purchaseUnit?: true
    salesUnit?: true
    conversionRatio?: true
    categoryId?: true
    isArchived?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: string
    name: string
    brand: string | null
    hsnCode: string
    gstRate: number
    baseUnit: string
    purchaseUnit: string | null
    salesUnit: string | null
    conversionRatio: number | null
    categoryId: string
    isArchived: boolean
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    brand?: boolean
    hsnCode?: boolean
    gstRate?: boolean
    baseUnit?: boolean
    purchaseUnit?: boolean
    salesUnit?: boolean
    conversionRatio?: boolean
    categoryId?: boolean
    isArchived?: boolean
    category?: boolean | CategoryDefaultArgs<ExtArgs>
    variants?: boolean | Product$variantsArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    brand?: boolean
    hsnCode?: boolean
    gstRate?: boolean
    baseUnit?: boolean
    purchaseUnit?: boolean
    salesUnit?: boolean
    conversionRatio?: boolean
    categoryId?: boolean
    isArchived?: boolean
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    brand?: boolean
    hsnCode?: boolean
    gstRate?: boolean
    baseUnit?: boolean
    purchaseUnit?: boolean
    salesUnit?: boolean
    conversionRatio?: boolean
    categoryId?: boolean
    isArchived?: boolean
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
    id?: boolean
    name?: boolean
    brand?: boolean
    hsnCode?: boolean
    gstRate?: boolean
    baseUnit?: boolean
    purchaseUnit?: boolean
    salesUnit?: boolean
    conversionRatio?: boolean
    categoryId?: boolean
    isArchived?: boolean
  }

  export type ProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "brand" | "hsnCode" | "gstRate" | "baseUnit" | "purchaseUnit" | "salesUnit" | "conversionRatio" | "categoryId" | "isArchived", ExtArgs["result"]["product"]>
  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | CategoryDefaultArgs<ExtArgs>
    variants?: boolean | Product$variantsArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }
  export type ProductIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | CategoryDefaultArgs<ExtArgs>
  }

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      category: Prisma.$CategoryPayload<ExtArgs>
      variants: Prisma.$VariantPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      brand: string | null
      hsnCode: string
      gstRate: number
      baseUnit: string
      purchaseUnit: string | null
      salesUnit: string | null
      conversionRatio: number | null
      categoryId: string
      isArchived: boolean
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productWithIdOnly = await prisma.product.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products and returns the data updated in the database.
     * @param {ProductUpdateManyAndReturnArgs} args - Arguments to update many Products.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Products and only return the `id`
     * const productWithIdOnly = await prisma.product.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProductUpdateManyAndReturnArgs>(args: SelectSubset<T, ProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends CategoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CategoryDefaultArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    variants<T extends Product$variantsArgs<ExtArgs> = {}>(args?: Subset<T, Product$variantsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Product model
   */
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'String'>
    readonly name: FieldRef<"Product", 'String'>
    readonly brand: FieldRef<"Product", 'String'>
    readonly hsnCode: FieldRef<"Product", 'String'>
    readonly gstRate: FieldRef<"Product", 'Float'>
    readonly baseUnit: FieldRef<"Product", 'String'>
    readonly purchaseUnit: FieldRef<"Product", 'String'>
    readonly salesUnit: FieldRef<"Product", 'String'>
    readonly conversionRatio: FieldRef<"Product", 'Float'>
    readonly categoryId: FieldRef<"Product", 'String'>
    readonly isArchived: FieldRef<"Product", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product updateManyAndReturn
   */
  export type ProductUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to delete.
     */
    limit?: number
  }

  /**
   * Product.variants
   */
  export type Product$variantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    where?: VariantWhereInput
    orderBy?: VariantOrderByWithRelationInput | VariantOrderByWithRelationInput[]
    cursor?: VariantWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VariantScalarFieldEnum | VariantScalarFieldEnum[]
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model Variant
   */

  export type AggregateVariant = {
    _count: VariantCountAggregateOutputType | null
    _avg: VariantAvgAggregateOutputType | null
    _sum: VariantSumAggregateOutputType | null
    _min: VariantMinAggregateOutputType | null
    _max: VariantMaxAggregateOutputType | null
  }

  export type VariantAvgAggregateOutputType = {
    purchasePrice: number | null
    sellingPrice: number | null
    markupPercent: number | null
    minStockLevel: number | null
  }

  export type VariantSumAggregateOutputType = {
    purchasePrice: number | null
    sellingPrice: number | null
    markupPercent: number | null
    minStockLevel: number | null
  }

  export type VariantMinAggregateOutputType = {
    id: string | null
    productId: string | null
    sku: string | null
    purchasePrice: number | null
    sellingPrice: number | null
    pricingMethod: string | null
    markupPercent: number | null
    minStockLevel: number | null
  }

  export type VariantMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    sku: string | null
    purchasePrice: number | null
    sellingPrice: number | null
    pricingMethod: string | null
    markupPercent: number | null
    minStockLevel: number | null
  }

  export type VariantCountAggregateOutputType = {
    id: number
    productId: number
    sku: number
    specifications: number
    purchasePrice: number
    sellingPrice: number
    pricingMethod: number
    markupPercent: number
    minStockLevel: number
    _all: number
  }


  export type VariantAvgAggregateInputType = {
    purchasePrice?: true
    sellingPrice?: true
    markupPercent?: true
    minStockLevel?: true
  }

  export type VariantSumAggregateInputType = {
    purchasePrice?: true
    sellingPrice?: true
    markupPercent?: true
    minStockLevel?: true
  }

  export type VariantMinAggregateInputType = {
    id?: true
    productId?: true
    sku?: true
    purchasePrice?: true
    sellingPrice?: true
    pricingMethod?: true
    markupPercent?: true
    minStockLevel?: true
  }

  export type VariantMaxAggregateInputType = {
    id?: true
    productId?: true
    sku?: true
    purchasePrice?: true
    sellingPrice?: true
    pricingMethod?: true
    markupPercent?: true
    minStockLevel?: true
  }

  export type VariantCountAggregateInputType = {
    id?: true
    productId?: true
    sku?: true
    specifications?: true
    purchasePrice?: true
    sellingPrice?: true
    pricingMethod?: true
    markupPercent?: true
    minStockLevel?: true
    _all?: true
  }

  export type VariantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Variant to aggregate.
     */
    where?: VariantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Variants to fetch.
     */
    orderBy?: VariantOrderByWithRelationInput | VariantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VariantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Variants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Variants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Variants
    **/
    _count?: true | VariantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VariantAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VariantSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VariantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VariantMaxAggregateInputType
  }

  export type GetVariantAggregateType<T extends VariantAggregateArgs> = {
        [P in keyof T & keyof AggregateVariant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVariant[P]>
      : GetScalarType<T[P], AggregateVariant[P]>
  }




  export type VariantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VariantWhereInput
    orderBy?: VariantOrderByWithAggregationInput | VariantOrderByWithAggregationInput[]
    by: VariantScalarFieldEnum[] | VariantScalarFieldEnum
    having?: VariantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VariantCountAggregateInputType | true
    _avg?: VariantAvgAggregateInputType
    _sum?: VariantSumAggregateInputType
    _min?: VariantMinAggregateInputType
    _max?: VariantMaxAggregateInputType
  }

  export type VariantGroupByOutputType = {
    id: string
    productId: string
    sku: string
    specifications: JsonValue | null
    purchasePrice: number
    sellingPrice: number
    pricingMethod: string
    markupPercent: number | null
    minStockLevel: number
    _count: VariantCountAggregateOutputType | null
    _avg: VariantAvgAggregateOutputType | null
    _sum: VariantSumAggregateOutputType | null
    _min: VariantMinAggregateOutputType | null
    _max: VariantMaxAggregateOutputType | null
  }

  type GetVariantGroupByPayload<T extends VariantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VariantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VariantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VariantGroupByOutputType[P]>
            : GetScalarType<T[P], VariantGroupByOutputType[P]>
        }
      >
    >


  export type VariantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    sku?: boolean
    specifications?: boolean
    purchasePrice?: boolean
    sellingPrice?: boolean
    pricingMethod?: boolean
    markupPercent?: boolean
    minStockLevel?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
    stocks?: boolean | Variant$stocksArgs<ExtArgs>
    txnItems?: boolean | Variant$txnItemsArgs<ExtArgs>
    suppliers?: boolean | Variant$suppliersArgs<ExtArgs>
    _count?: boolean | VariantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["variant"]>

  export type VariantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    sku?: boolean
    specifications?: boolean
    purchasePrice?: boolean
    sellingPrice?: boolean
    pricingMethod?: boolean
    markupPercent?: boolean
    minStockLevel?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["variant"]>

  export type VariantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    sku?: boolean
    specifications?: boolean
    purchasePrice?: boolean
    sellingPrice?: boolean
    pricingMethod?: boolean
    markupPercent?: boolean
    minStockLevel?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["variant"]>

  export type VariantSelectScalar = {
    id?: boolean
    productId?: boolean
    sku?: boolean
    specifications?: boolean
    purchasePrice?: boolean
    sellingPrice?: boolean
    pricingMethod?: boolean
    markupPercent?: boolean
    minStockLevel?: boolean
  }

  export type VariantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "productId" | "sku" | "specifications" | "purchasePrice" | "sellingPrice" | "pricingMethod" | "markupPercent" | "minStockLevel", ExtArgs["result"]["variant"]>
  export type VariantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
    stocks?: boolean | Variant$stocksArgs<ExtArgs>
    txnItems?: boolean | Variant$txnItemsArgs<ExtArgs>
    suppliers?: boolean | Variant$suppliersArgs<ExtArgs>
    _count?: boolean | VariantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type VariantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type VariantIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $VariantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Variant"
    objects: {
      product: Prisma.$ProductPayload<ExtArgs>
      stocks: Prisma.$StockPayload<ExtArgs>[]
      txnItems: Prisma.$TransactionItemPayload<ExtArgs>[]
      suppliers: Prisma.$VendorProductPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      sku: string
      specifications: Prisma.JsonValue | null
      purchasePrice: number
      sellingPrice: number
      pricingMethod: string
      markupPercent: number | null
      minStockLevel: number
    }, ExtArgs["result"]["variant"]>
    composites: {}
  }

  type VariantGetPayload<S extends boolean | null | undefined | VariantDefaultArgs> = $Result.GetResult<Prisma.$VariantPayload, S>

  type VariantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VariantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VariantCountAggregateInputType | true
    }

  export interface VariantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Variant'], meta: { name: 'Variant' } }
    /**
     * Find zero or one Variant that matches the filter.
     * @param {VariantFindUniqueArgs} args - Arguments to find a Variant
     * @example
     * // Get one Variant
     * const variant = await prisma.variant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VariantFindUniqueArgs>(args: SelectSubset<T, VariantFindUniqueArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Variant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VariantFindUniqueOrThrowArgs} args - Arguments to find a Variant
     * @example
     * // Get one Variant
     * const variant = await prisma.variant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VariantFindUniqueOrThrowArgs>(args: SelectSubset<T, VariantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Variant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantFindFirstArgs} args - Arguments to find a Variant
     * @example
     * // Get one Variant
     * const variant = await prisma.variant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VariantFindFirstArgs>(args?: SelectSubset<T, VariantFindFirstArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Variant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantFindFirstOrThrowArgs} args - Arguments to find a Variant
     * @example
     * // Get one Variant
     * const variant = await prisma.variant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VariantFindFirstOrThrowArgs>(args?: SelectSubset<T, VariantFindFirstOrThrowArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Variants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Variants
     * const variants = await prisma.variant.findMany()
     * 
     * // Get first 10 Variants
     * const variants = await prisma.variant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const variantWithIdOnly = await prisma.variant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VariantFindManyArgs>(args?: SelectSubset<T, VariantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Variant.
     * @param {VariantCreateArgs} args - Arguments to create a Variant.
     * @example
     * // Create one Variant
     * const Variant = await prisma.variant.create({
     *   data: {
     *     // ... data to create a Variant
     *   }
     * })
     * 
     */
    create<T extends VariantCreateArgs>(args: SelectSubset<T, VariantCreateArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Variants.
     * @param {VariantCreateManyArgs} args - Arguments to create many Variants.
     * @example
     * // Create many Variants
     * const variant = await prisma.variant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VariantCreateManyArgs>(args?: SelectSubset<T, VariantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Variants and returns the data saved in the database.
     * @param {VariantCreateManyAndReturnArgs} args - Arguments to create many Variants.
     * @example
     * // Create many Variants
     * const variant = await prisma.variant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Variants and only return the `id`
     * const variantWithIdOnly = await prisma.variant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VariantCreateManyAndReturnArgs>(args?: SelectSubset<T, VariantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Variant.
     * @param {VariantDeleteArgs} args - Arguments to delete one Variant.
     * @example
     * // Delete one Variant
     * const Variant = await prisma.variant.delete({
     *   where: {
     *     // ... filter to delete one Variant
     *   }
     * })
     * 
     */
    delete<T extends VariantDeleteArgs>(args: SelectSubset<T, VariantDeleteArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Variant.
     * @param {VariantUpdateArgs} args - Arguments to update one Variant.
     * @example
     * // Update one Variant
     * const variant = await prisma.variant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VariantUpdateArgs>(args: SelectSubset<T, VariantUpdateArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Variants.
     * @param {VariantDeleteManyArgs} args - Arguments to filter Variants to delete.
     * @example
     * // Delete a few Variants
     * const { count } = await prisma.variant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VariantDeleteManyArgs>(args?: SelectSubset<T, VariantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Variants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Variants
     * const variant = await prisma.variant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VariantUpdateManyArgs>(args: SelectSubset<T, VariantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Variants and returns the data updated in the database.
     * @param {VariantUpdateManyAndReturnArgs} args - Arguments to update many Variants.
     * @example
     * // Update many Variants
     * const variant = await prisma.variant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Variants and only return the `id`
     * const variantWithIdOnly = await prisma.variant.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VariantUpdateManyAndReturnArgs>(args: SelectSubset<T, VariantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Variant.
     * @param {VariantUpsertArgs} args - Arguments to update or create a Variant.
     * @example
     * // Update or create a Variant
     * const variant = await prisma.variant.upsert({
     *   create: {
     *     // ... data to create a Variant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Variant we want to update
     *   }
     * })
     */
    upsert<T extends VariantUpsertArgs>(args: SelectSubset<T, VariantUpsertArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Variants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantCountArgs} args - Arguments to filter Variants to count.
     * @example
     * // Count the number of Variants
     * const count = await prisma.variant.count({
     *   where: {
     *     // ... the filter for the Variants we want to count
     *   }
     * })
    **/
    count<T extends VariantCountArgs>(
      args?: Subset<T, VariantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VariantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Variant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VariantAggregateArgs>(args: Subset<T, VariantAggregateArgs>): Prisma.PrismaPromise<GetVariantAggregateType<T>>

    /**
     * Group by Variant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VariantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VariantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VariantGroupByArgs['orderBy'] }
        : { orderBy?: VariantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VariantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVariantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Variant model
   */
  readonly fields: VariantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Variant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VariantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    stocks<T extends Variant$stocksArgs<ExtArgs> = {}>(args?: Subset<T, Variant$stocksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    txnItems<T extends Variant$txnItemsArgs<ExtArgs> = {}>(args?: Subset<T, Variant$txnItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    suppliers<T extends Variant$suppliersArgs<ExtArgs> = {}>(args?: Subset<T, Variant$suppliersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Variant model
   */
  interface VariantFieldRefs {
    readonly id: FieldRef<"Variant", 'String'>
    readonly productId: FieldRef<"Variant", 'String'>
    readonly sku: FieldRef<"Variant", 'String'>
    readonly specifications: FieldRef<"Variant", 'Json'>
    readonly purchasePrice: FieldRef<"Variant", 'Float'>
    readonly sellingPrice: FieldRef<"Variant", 'Float'>
    readonly pricingMethod: FieldRef<"Variant", 'String'>
    readonly markupPercent: FieldRef<"Variant", 'Float'>
    readonly minStockLevel: FieldRef<"Variant", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * Variant findUnique
   */
  export type VariantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter, which Variant to fetch.
     */
    where: VariantWhereUniqueInput
  }

  /**
   * Variant findUniqueOrThrow
   */
  export type VariantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter, which Variant to fetch.
     */
    where: VariantWhereUniqueInput
  }

  /**
   * Variant findFirst
   */
  export type VariantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter, which Variant to fetch.
     */
    where?: VariantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Variants to fetch.
     */
    orderBy?: VariantOrderByWithRelationInput | VariantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Variants.
     */
    cursor?: VariantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Variants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Variants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Variants.
     */
    distinct?: VariantScalarFieldEnum | VariantScalarFieldEnum[]
  }

  /**
   * Variant findFirstOrThrow
   */
  export type VariantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter, which Variant to fetch.
     */
    where?: VariantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Variants to fetch.
     */
    orderBy?: VariantOrderByWithRelationInput | VariantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Variants.
     */
    cursor?: VariantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Variants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Variants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Variants.
     */
    distinct?: VariantScalarFieldEnum | VariantScalarFieldEnum[]
  }

  /**
   * Variant findMany
   */
  export type VariantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter, which Variants to fetch.
     */
    where?: VariantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Variants to fetch.
     */
    orderBy?: VariantOrderByWithRelationInput | VariantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Variants.
     */
    cursor?: VariantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Variants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Variants.
     */
    skip?: number
    distinct?: VariantScalarFieldEnum | VariantScalarFieldEnum[]
  }

  /**
   * Variant create
   */
  export type VariantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * The data needed to create a Variant.
     */
    data: XOR<VariantCreateInput, VariantUncheckedCreateInput>
  }

  /**
   * Variant createMany
   */
  export type VariantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Variants.
     */
    data: VariantCreateManyInput | VariantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Variant createManyAndReturn
   */
  export type VariantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * The data used to create many Variants.
     */
    data: VariantCreateManyInput | VariantCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Variant update
   */
  export type VariantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * The data needed to update a Variant.
     */
    data: XOR<VariantUpdateInput, VariantUncheckedUpdateInput>
    /**
     * Choose, which Variant to update.
     */
    where: VariantWhereUniqueInput
  }

  /**
   * Variant updateMany
   */
  export type VariantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Variants.
     */
    data: XOR<VariantUpdateManyMutationInput, VariantUncheckedUpdateManyInput>
    /**
     * Filter which Variants to update
     */
    where?: VariantWhereInput
    /**
     * Limit how many Variants to update.
     */
    limit?: number
  }

  /**
   * Variant updateManyAndReturn
   */
  export type VariantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * The data used to update Variants.
     */
    data: XOR<VariantUpdateManyMutationInput, VariantUncheckedUpdateManyInput>
    /**
     * Filter which Variants to update
     */
    where?: VariantWhereInput
    /**
     * Limit how many Variants to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Variant upsert
   */
  export type VariantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * The filter to search for the Variant to update in case it exists.
     */
    where: VariantWhereUniqueInput
    /**
     * In case the Variant found by the `where` argument doesn't exist, create a new Variant with this data.
     */
    create: XOR<VariantCreateInput, VariantUncheckedCreateInput>
    /**
     * In case the Variant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VariantUpdateInput, VariantUncheckedUpdateInput>
  }

  /**
   * Variant delete
   */
  export type VariantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
    /**
     * Filter which Variant to delete.
     */
    where: VariantWhereUniqueInput
  }

  /**
   * Variant deleteMany
   */
  export type VariantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Variants to delete
     */
    where?: VariantWhereInput
    /**
     * Limit how many Variants to delete.
     */
    limit?: number
  }

  /**
   * Variant.stocks
   */
  export type Variant$stocksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    where?: StockWhereInput
    orderBy?: StockOrderByWithRelationInput | StockOrderByWithRelationInput[]
    cursor?: StockWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StockScalarFieldEnum | StockScalarFieldEnum[]
  }

  /**
   * Variant.txnItems
   */
  export type Variant$txnItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    where?: TransactionItemWhereInput
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    cursor?: TransactionItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionItemScalarFieldEnum | TransactionItemScalarFieldEnum[]
  }

  /**
   * Variant.suppliers
   */
  export type Variant$suppliersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
    where?: VendorProductWhereInput
    orderBy?: VendorProductOrderByWithRelationInput | VendorProductOrderByWithRelationInput[]
    cursor?: VendorProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VendorProductScalarFieldEnum | VendorProductScalarFieldEnum[]
  }

  /**
   * Variant without action
   */
  export type VariantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Variant
     */
    select?: VariantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Variant
     */
    omit?: VariantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VariantInclude<ExtArgs> | null
  }


  /**
   * Model Stock
   */

  export type AggregateStock = {
    _count: StockCountAggregateOutputType | null
    _avg: StockAvgAggregateOutputType | null
    _sum: StockSumAggregateOutputType | null
    _min: StockMinAggregateOutputType | null
    _max: StockMaxAggregateOutputType | null
  }

  export type StockAvgAggregateOutputType = {
    quantity: number | null
    inTransitQty: number | null
  }

  export type StockSumAggregateOutputType = {
    quantity: number | null
    inTransitQty: number | null
  }

  export type StockMinAggregateOutputType = {
    id: string | null
    variantId: string | null
    warehouseId: string | null
    outletId: string | null
    quantity: number | null
    inTransitQty: number | null
  }

  export type StockMaxAggregateOutputType = {
    id: string | null
    variantId: string | null
    warehouseId: string | null
    outletId: string | null
    quantity: number | null
    inTransitQty: number | null
  }

  export type StockCountAggregateOutputType = {
    id: number
    variantId: number
    warehouseId: number
    outletId: number
    quantity: number
    inTransitQty: number
    _all: number
  }


  export type StockAvgAggregateInputType = {
    quantity?: true
    inTransitQty?: true
  }

  export type StockSumAggregateInputType = {
    quantity?: true
    inTransitQty?: true
  }

  export type StockMinAggregateInputType = {
    id?: true
    variantId?: true
    warehouseId?: true
    outletId?: true
    quantity?: true
    inTransitQty?: true
  }

  export type StockMaxAggregateInputType = {
    id?: true
    variantId?: true
    warehouseId?: true
    outletId?: true
    quantity?: true
    inTransitQty?: true
  }

  export type StockCountAggregateInputType = {
    id?: true
    variantId?: true
    warehouseId?: true
    outletId?: true
    quantity?: true
    inTransitQty?: true
    _all?: true
  }

  export type StockAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Stock to aggregate.
     */
    where?: StockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stocks to fetch.
     */
    orderBy?: StockOrderByWithRelationInput | StockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Stocks
    **/
    _count?: true | StockCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StockAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StockSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StockMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StockMaxAggregateInputType
  }

  export type GetStockAggregateType<T extends StockAggregateArgs> = {
        [P in keyof T & keyof AggregateStock]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStock[P]>
      : GetScalarType<T[P], AggregateStock[P]>
  }




  export type StockGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StockWhereInput
    orderBy?: StockOrderByWithAggregationInput | StockOrderByWithAggregationInput[]
    by: StockScalarFieldEnum[] | StockScalarFieldEnum
    having?: StockScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StockCountAggregateInputType | true
    _avg?: StockAvgAggregateInputType
    _sum?: StockSumAggregateInputType
    _min?: StockMinAggregateInputType
    _max?: StockMaxAggregateInputType
  }

  export type StockGroupByOutputType = {
    id: string
    variantId: string
    warehouseId: string | null
    outletId: string | null
    quantity: number
    inTransitQty: number
    _count: StockCountAggregateOutputType | null
    _avg: StockAvgAggregateOutputType | null
    _sum: StockSumAggregateOutputType | null
    _min: StockMinAggregateOutputType | null
    _max: StockMaxAggregateOutputType | null
  }

  type GetStockGroupByPayload<T extends StockGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StockGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StockGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StockGroupByOutputType[P]>
            : GetScalarType<T[P], StockGroupByOutputType[P]>
        }
      >
    >


  export type StockSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    variantId?: boolean
    warehouseId?: boolean
    outletId?: boolean
    quantity?: boolean
    inTransitQty?: boolean
    variant?: boolean | VariantDefaultArgs<ExtArgs>
    warehouse?: boolean | Stock$warehouseArgs<ExtArgs>
    outlet?: boolean | Stock$outletArgs<ExtArgs>
  }, ExtArgs["result"]["stock"]>

  export type StockSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    variantId?: boolean
    warehouseId?: boolean
    outletId?: boolean
    quantity?: boolean
    inTransitQty?: boolean
    variant?: boolean | VariantDefaultArgs<ExtArgs>
    warehouse?: boolean | Stock$warehouseArgs<ExtArgs>
    outlet?: boolean | Stock$outletArgs<ExtArgs>
  }, ExtArgs["result"]["stock"]>

  export type StockSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    variantId?: boolean
    warehouseId?: boolean
    outletId?: boolean
    quantity?: boolean
    inTransitQty?: boolean
    variant?: boolean | VariantDefaultArgs<ExtArgs>
    warehouse?: boolean | Stock$warehouseArgs<ExtArgs>
    outlet?: boolean | Stock$outletArgs<ExtArgs>
  }, ExtArgs["result"]["stock"]>

  export type StockSelectScalar = {
    id?: boolean
    variantId?: boolean
    warehouseId?: boolean
    outletId?: boolean
    quantity?: boolean
    inTransitQty?: boolean
  }

  export type StockOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "variantId" | "warehouseId" | "outletId" | "quantity" | "inTransitQty", ExtArgs["result"]["stock"]>
  export type StockInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    variant?: boolean | VariantDefaultArgs<ExtArgs>
    warehouse?: boolean | Stock$warehouseArgs<ExtArgs>
    outlet?: boolean | Stock$outletArgs<ExtArgs>
  }
  export type StockIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    variant?: boolean | VariantDefaultArgs<ExtArgs>
    warehouse?: boolean | Stock$warehouseArgs<ExtArgs>
    outlet?: boolean | Stock$outletArgs<ExtArgs>
  }
  export type StockIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    variant?: boolean | VariantDefaultArgs<ExtArgs>
    warehouse?: boolean | Stock$warehouseArgs<ExtArgs>
    outlet?: boolean | Stock$outletArgs<ExtArgs>
  }

  export type $StockPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Stock"
    objects: {
      variant: Prisma.$VariantPayload<ExtArgs>
      warehouse: Prisma.$WarehousePayload<ExtArgs> | null
      outlet: Prisma.$OutletPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      variantId: string
      warehouseId: string | null
      outletId: string | null
      quantity: number
      inTransitQty: number
    }, ExtArgs["result"]["stock"]>
    composites: {}
  }

  type StockGetPayload<S extends boolean | null | undefined | StockDefaultArgs> = $Result.GetResult<Prisma.$StockPayload, S>

  type StockCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StockFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StockCountAggregateInputType | true
    }

  export interface StockDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Stock'], meta: { name: 'Stock' } }
    /**
     * Find zero or one Stock that matches the filter.
     * @param {StockFindUniqueArgs} args - Arguments to find a Stock
     * @example
     * // Get one Stock
     * const stock = await prisma.stock.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StockFindUniqueArgs>(args: SelectSubset<T, StockFindUniqueArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Stock that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StockFindUniqueOrThrowArgs} args - Arguments to find a Stock
     * @example
     * // Get one Stock
     * const stock = await prisma.stock.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StockFindUniqueOrThrowArgs>(args: SelectSubset<T, StockFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Stock that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockFindFirstArgs} args - Arguments to find a Stock
     * @example
     * // Get one Stock
     * const stock = await prisma.stock.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StockFindFirstArgs>(args?: SelectSubset<T, StockFindFirstArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Stock that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockFindFirstOrThrowArgs} args - Arguments to find a Stock
     * @example
     * // Get one Stock
     * const stock = await prisma.stock.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StockFindFirstOrThrowArgs>(args?: SelectSubset<T, StockFindFirstOrThrowArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Stocks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Stocks
     * const stocks = await prisma.stock.findMany()
     * 
     * // Get first 10 Stocks
     * const stocks = await prisma.stock.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stockWithIdOnly = await prisma.stock.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StockFindManyArgs>(args?: SelectSubset<T, StockFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Stock.
     * @param {StockCreateArgs} args - Arguments to create a Stock.
     * @example
     * // Create one Stock
     * const Stock = await prisma.stock.create({
     *   data: {
     *     // ... data to create a Stock
     *   }
     * })
     * 
     */
    create<T extends StockCreateArgs>(args: SelectSubset<T, StockCreateArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Stocks.
     * @param {StockCreateManyArgs} args - Arguments to create many Stocks.
     * @example
     * // Create many Stocks
     * const stock = await prisma.stock.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StockCreateManyArgs>(args?: SelectSubset<T, StockCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Stocks and returns the data saved in the database.
     * @param {StockCreateManyAndReturnArgs} args - Arguments to create many Stocks.
     * @example
     * // Create many Stocks
     * const stock = await prisma.stock.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Stocks and only return the `id`
     * const stockWithIdOnly = await prisma.stock.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StockCreateManyAndReturnArgs>(args?: SelectSubset<T, StockCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Stock.
     * @param {StockDeleteArgs} args - Arguments to delete one Stock.
     * @example
     * // Delete one Stock
     * const Stock = await prisma.stock.delete({
     *   where: {
     *     // ... filter to delete one Stock
     *   }
     * })
     * 
     */
    delete<T extends StockDeleteArgs>(args: SelectSubset<T, StockDeleteArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Stock.
     * @param {StockUpdateArgs} args - Arguments to update one Stock.
     * @example
     * // Update one Stock
     * const stock = await prisma.stock.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StockUpdateArgs>(args: SelectSubset<T, StockUpdateArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Stocks.
     * @param {StockDeleteManyArgs} args - Arguments to filter Stocks to delete.
     * @example
     * // Delete a few Stocks
     * const { count } = await prisma.stock.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StockDeleteManyArgs>(args?: SelectSubset<T, StockDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Stocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Stocks
     * const stock = await prisma.stock.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StockUpdateManyArgs>(args: SelectSubset<T, StockUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Stocks and returns the data updated in the database.
     * @param {StockUpdateManyAndReturnArgs} args - Arguments to update many Stocks.
     * @example
     * // Update many Stocks
     * const stock = await prisma.stock.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Stocks and only return the `id`
     * const stockWithIdOnly = await prisma.stock.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends StockUpdateManyAndReturnArgs>(args: SelectSubset<T, StockUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Stock.
     * @param {StockUpsertArgs} args - Arguments to update or create a Stock.
     * @example
     * // Update or create a Stock
     * const stock = await prisma.stock.upsert({
     *   create: {
     *     // ... data to create a Stock
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Stock we want to update
     *   }
     * })
     */
    upsert<T extends StockUpsertArgs>(args: SelectSubset<T, StockUpsertArgs<ExtArgs>>): Prisma__StockClient<$Result.GetResult<Prisma.$StockPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Stocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockCountArgs} args - Arguments to filter Stocks to count.
     * @example
     * // Count the number of Stocks
     * const count = await prisma.stock.count({
     *   where: {
     *     // ... the filter for the Stocks we want to count
     *   }
     * })
    **/
    count<T extends StockCountArgs>(
      args?: Subset<T, StockCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StockCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Stock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StockAggregateArgs>(args: Subset<T, StockAggregateArgs>): Prisma.PrismaPromise<GetStockAggregateType<T>>

    /**
     * Group by Stock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StockGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StockGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StockGroupByArgs['orderBy'] }
        : { orderBy?: StockGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StockGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStockGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Stock model
   */
  readonly fields: StockFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Stock.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StockClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    variant<T extends VariantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VariantDefaultArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    warehouse<T extends Stock$warehouseArgs<ExtArgs> = {}>(args?: Subset<T, Stock$warehouseArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    outlet<T extends Stock$outletArgs<ExtArgs> = {}>(args?: Subset<T, Stock$outletArgs<ExtArgs>>): Prisma__OutletClient<$Result.GetResult<Prisma.$OutletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Stock model
   */
  interface StockFieldRefs {
    readonly id: FieldRef<"Stock", 'String'>
    readonly variantId: FieldRef<"Stock", 'String'>
    readonly warehouseId: FieldRef<"Stock", 'String'>
    readonly outletId: FieldRef<"Stock", 'String'>
    readonly quantity: FieldRef<"Stock", 'Float'>
    readonly inTransitQty: FieldRef<"Stock", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * Stock findUnique
   */
  export type StockFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter, which Stock to fetch.
     */
    where: StockWhereUniqueInput
  }

  /**
   * Stock findUniqueOrThrow
   */
  export type StockFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter, which Stock to fetch.
     */
    where: StockWhereUniqueInput
  }

  /**
   * Stock findFirst
   */
  export type StockFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter, which Stock to fetch.
     */
    where?: StockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stocks to fetch.
     */
    orderBy?: StockOrderByWithRelationInput | StockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stocks.
     */
    cursor?: StockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stocks.
     */
    distinct?: StockScalarFieldEnum | StockScalarFieldEnum[]
  }

  /**
   * Stock findFirstOrThrow
   */
  export type StockFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter, which Stock to fetch.
     */
    where?: StockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stocks to fetch.
     */
    orderBy?: StockOrderByWithRelationInput | StockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stocks.
     */
    cursor?: StockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stocks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stocks.
     */
    distinct?: StockScalarFieldEnum | StockScalarFieldEnum[]
  }

  /**
   * Stock findMany
   */
  export type StockFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter, which Stocks to fetch.
     */
    where?: StockWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stocks to fetch.
     */
    orderBy?: StockOrderByWithRelationInput | StockOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Stocks.
     */
    cursor?: StockWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stocks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stocks.
     */
    skip?: number
    distinct?: StockScalarFieldEnum | StockScalarFieldEnum[]
  }

  /**
   * Stock create
   */
  export type StockCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * The data needed to create a Stock.
     */
    data: XOR<StockCreateInput, StockUncheckedCreateInput>
  }

  /**
   * Stock createMany
   */
  export type StockCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Stocks.
     */
    data: StockCreateManyInput | StockCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Stock createManyAndReturn
   */
  export type StockCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * The data used to create many Stocks.
     */
    data: StockCreateManyInput | StockCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Stock update
   */
  export type StockUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * The data needed to update a Stock.
     */
    data: XOR<StockUpdateInput, StockUncheckedUpdateInput>
    /**
     * Choose, which Stock to update.
     */
    where: StockWhereUniqueInput
  }

  /**
   * Stock updateMany
   */
  export type StockUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Stocks.
     */
    data: XOR<StockUpdateManyMutationInput, StockUncheckedUpdateManyInput>
    /**
     * Filter which Stocks to update
     */
    where?: StockWhereInput
    /**
     * Limit how many Stocks to update.
     */
    limit?: number
  }

  /**
   * Stock updateManyAndReturn
   */
  export type StockUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * The data used to update Stocks.
     */
    data: XOR<StockUpdateManyMutationInput, StockUncheckedUpdateManyInput>
    /**
     * Filter which Stocks to update
     */
    where?: StockWhereInput
    /**
     * Limit how many Stocks to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Stock upsert
   */
  export type StockUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * The filter to search for the Stock to update in case it exists.
     */
    where: StockWhereUniqueInput
    /**
     * In case the Stock found by the `where` argument doesn't exist, create a new Stock with this data.
     */
    create: XOR<StockCreateInput, StockUncheckedCreateInput>
    /**
     * In case the Stock was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StockUpdateInput, StockUncheckedUpdateInput>
  }

  /**
   * Stock delete
   */
  export type StockDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
    /**
     * Filter which Stock to delete.
     */
    where: StockWhereUniqueInput
  }

  /**
   * Stock deleteMany
   */
  export type StockDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Stocks to delete
     */
    where?: StockWhereInput
    /**
     * Limit how many Stocks to delete.
     */
    limit?: number
  }

  /**
   * Stock.warehouse
   */
  export type Stock$warehouseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Warehouse
     */
    omit?: WarehouseOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    where?: WarehouseWhereInput
  }

  /**
   * Stock.outlet
   */
  export type Stock$outletArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Outlet
     */
    select?: OutletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Outlet
     */
    omit?: OutletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OutletInclude<ExtArgs> | null
    where?: OutletWhereInput
  }

  /**
   * Stock without action
   */
  export type StockDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stock
     */
    select?: StockSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Stock
     */
    omit?: StockOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StockInclude<ExtArgs> | null
  }


  /**
   * Model Party
   */

  export type AggregateParty = {
    _count: PartyCountAggregateOutputType | null
    _avg: PartyAvgAggregateOutputType | null
    _sum: PartySumAggregateOutputType | null
    _min: PartyMinAggregateOutputType | null
    _max: PartyMaxAggregateOutputType | null
  }

  export type PartyAvgAggregateOutputType = {
    creditPeriod: number | null
    creditLimit: number | null
    openingBalance: number | null
  }

  export type PartySumAggregateOutputType = {
    creditPeriod: number | null
    creditLimit: number | null
    openingBalance: number | null
  }

  export type PartyMinAggregateOutputType = {
    id: string | null
    type: $Enums.PartyType | null
    name: string | null
    gstin: string | null
    pan: string | null
    address: string | null
    state: string | null
    contactInfo: string | null
    creditPeriod: number | null
    creditLimit: number | null
    openingBalance: number | null
  }

  export type PartyMaxAggregateOutputType = {
    id: string | null
    type: $Enums.PartyType | null
    name: string | null
    gstin: string | null
    pan: string | null
    address: string | null
    state: string | null
    contactInfo: string | null
    creditPeriod: number | null
    creditLimit: number | null
    openingBalance: number | null
  }

  export type PartyCountAggregateOutputType = {
    id: number
    type: number
    name: number
    gstin: number
    pan: number
    address: number
    state: number
    contactInfo: number
    creditPeriod: number
    creditLimit: number
    openingBalance: number
    _all: number
  }


  export type PartyAvgAggregateInputType = {
    creditPeriod?: true
    creditLimit?: true
    openingBalance?: true
  }

  export type PartySumAggregateInputType = {
    creditPeriod?: true
    creditLimit?: true
    openingBalance?: true
  }

  export type PartyMinAggregateInputType = {
    id?: true
    type?: true
    name?: true
    gstin?: true
    pan?: true
    address?: true
    state?: true
    contactInfo?: true
    creditPeriod?: true
    creditLimit?: true
    openingBalance?: true
  }

  export type PartyMaxAggregateInputType = {
    id?: true
    type?: true
    name?: true
    gstin?: true
    pan?: true
    address?: true
    state?: true
    contactInfo?: true
    creditPeriod?: true
    creditLimit?: true
    openingBalance?: true
  }

  export type PartyCountAggregateInputType = {
    id?: true
    type?: true
    name?: true
    gstin?: true
    pan?: true
    address?: true
    state?: true
    contactInfo?: true
    creditPeriod?: true
    creditLimit?: true
    openingBalance?: true
    _all?: true
  }

  export type PartyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Party to aggregate.
     */
    where?: PartyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Parties to fetch.
     */
    orderBy?: PartyOrderByWithRelationInput | PartyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PartyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Parties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Parties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Parties
    **/
    _count?: true | PartyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PartyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PartySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PartyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PartyMaxAggregateInputType
  }

  export type GetPartyAggregateType<T extends PartyAggregateArgs> = {
        [P in keyof T & keyof AggregateParty]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateParty[P]>
      : GetScalarType<T[P], AggregateParty[P]>
  }




  export type PartyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PartyWhereInput
    orderBy?: PartyOrderByWithAggregationInput | PartyOrderByWithAggregationInput[]
    by: PartyScalarFieldEnum[] | PartyScalarFieldEnum
    having?: PartyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PartyCountAggregateInputType | true
    _avg?: PartyAvgAggregateInputType
    _sum?: PartySumAggregateInputType
    _min?: PartyMinAggregateInputType
    _max?: PartyMaxAggregateInputType
  }

  export type PartyGroupByOutputType = {
    id: string
    type: $Enums.PartyType
    name: string
    gstin: string | null
    pan: string | null
    address: string
    state: string
    contactInfo: string | null
    creditPeriod: number
    creditLimit: number | null
    openingBalance: number
    _count: PartyCountAggregateOutputType | null
    _avg: PartyAvgAggregateOutputType | null
    _sum: PartySumAggregateOutputType | null
    _min: PartyMinAggregateOutputType | null
    _max: PartyMaxAggregateOutputType | null
  }

  type GetPartyGroupByPayload<T extends PartyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PartyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PartyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PartyGroupByOutputType[P]>
            : GetScalarType<T[P], PartyGroupByOutputType[P]>
        }
      >
    >


  export type PartySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    name?: boolean
    gstin?: boolean
    pan?: boolean
    address?: boolean
    state?: boolean
    contactInfo?: boolean
    creditPeriod?: boolean
    creditLimit?: boolean
    openingBalance?: boolean
    transactions?: boolean | Party$transactionsArgs<ExtArgs>
    ledgerEntries?: boolean | Party$ledgerEntriesArgs<ExtArgs>
    suppliedProducts?: boolean | Party$suppliedProductsArgs<ExtArgs>
    _count?: boolean | PartyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["party"]>

  export type PartySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    name?: boolean
    gstin?: boolean
    pan?: boolean
    address?: boolean
    state?: boolean
    contactInfo?: boolean
    creditPeriod?: boolean
    creditLimit?: boolean
    openingBalance?: boolean
  }, ExtArgs["result"]["party"]>

  export type PartySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    name?: boolean
    gstin?: boolean
    pan?: boolean
    address?: boolean
    state?: boolean
    contactInfo?: boolean
    creditPeriod?: boolean
    creditLimit?: boolean
    openingBalance?: boolean
  }, ExtArgs["result"]["party"]>

  export type PartySelectScalar = {
    id?: boolean
    type?: boolean
    name?: boolean
    gstin?: boolean
    pan?: boolean
    address?: boolean
    state?: boolean
    contactInfo?: boolean
    creditPeriod?: boolean
    creditLimit?: boolean
    openingBalance?: boolean
  }

  export type PartyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "type" | "name" | "gstin" | "pan" | "address" | "state" | "contactInfo" | "creditPeriod" | "creditLimit" | "openingBalance", ExtArgs["result"]["party"]>
  export type PartyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transactions?: boolean | Party$transactionsArgs<ExtArgs>
    ledgerEntries?: boolean | Party$ledgerEntriesArgs<ExtArgs>
    suppliedProducts?: boolean | Party$suppliedProductsArgs<ExtArgs>
    _count?: boolean | PartyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PartyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type PartyIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $PartyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Party"
    objects: {
      transactions: Prisma.$TransactionPayload<ExtArgs>[]
      ledgerEntries: Prisma.$LedgerEntryPayload<ExtArgs>[]
      suppliedProducts: Prisma.$VendorProductPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: $Enums.PartyType
      name: string
      gstin: string | null
      pan: string | null
      address: string
      state: string
      contactInfo: string | null
      creditPeriod: number
      creditLimit: number | null
      openingBalance: number
    }, ExtArgs["result"]["party"]>
    composites: {}
  }

  type PartyGetPayload<S extends boolean | null | undefined | PartyDefaultArgs> = $Result.GetResult<Prisma.$PartyPayload, S>

  type PartyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PartyFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PartyCountAggregateInputType | true
    }

  export interface PartyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Party'], meta: { name: 'Party' } }
    /**
     * Find zero or one Party that matches the filter.
     * @param {PartyFindUniqueArgs} args - Arguments to find a Party
     * @example
     * // Get one Party
     * const party = await prisma.party.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PartyFindUniqueArgs>(args: SelectSubset<T, PartyFindUniqueArgs<ExtArgs>>): Prisma__PartyClient<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Party that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PartyFindUniqueOrThrowArgs} args - Arguments to find a Party
     * @example
     * // Get one Party
     * const party = await prisma.party.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PartyFindUniqueOrThrowArgs>(args: SelectSubset<T, PartyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PartyClient<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Party that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PartyFindFirstArgs} args - Arguments to find a Party
     * @example
     * // Get one Party
     * const party = await prisma.party.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PartyFindFirstArgs>(args?: SelectSubset<T, PartyFindFirstArgs<ExtArgs>>): Prisma__PartyClient<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Party that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PartyFindFirstOrThrowArgs} args - Arguments to find a Party
     * @example
     * // Get one Party
     * const party = await prisma.party.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PartyFindFirstOrThrowArgs>(args?: SelectSubset<T, PartyFindFirstOrThrowArgs<ExtArgs>>): Prisma__PartyClient<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Parties that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PartyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Parties
     * const parties = await prisma.party.findMany()
     * 
     * // Get first 10 Parties
     * const parties = await prisma.party.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const partyWithIdOnly = await prisma.party.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PartyFindManyArgs>(args?: SelectSubset<T, PartyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Party.
     * @param {PartyCreateArgs} args - Arguments to create a Party.
     * @example
     * // Create one Party
     * const Party = await prisma.party.create({
     *   data: {
     *     // ... data to create a Party
     *   }
     * })
     * 
     */
    create<T extends PartyCreateArgs>(args: SelectSubset<T, PartyCreateArgs<ExtArgs>>): Prisma__PartyClient<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Parties.
     * @param {PartyCreateManyArgs} args - Arguments to create many Parties.
     * @example
     * // Create many Parties
     * const party = await prisma.party.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PartyCreateManyArgs>(args?: SelectSubset<T, PartyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Parties and returns the data saved in the database.
     * @param {PartyCreateManyAndReturnArgs} args - Arguments to create many Parties.
     * @example
     * // Create many Parties
     * const party = await prisma.party.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Parties and only return the `id`
     * const partyWithIdOnly = await prisma.party.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PartyCreateManyAndReturnArgs>(args?: SelectSubset<T, PartyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Party.
     * @param {PartyDeleteArgs} args - Arguments to delete one Party.
     * @example
     * // Delete one Party
     * const Party = await prisma.party.delete({
     *   where: {
     *     // ... filter to delete one Party
     *   }
     * })
     * 
     */
    delete<T extends PartyDeleteArgs>(args: SelectSubset<T, PartyDeleteArgs<ExtArgs>>): Prisma__PartyClient<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Party.
     * @param {PartyUpdateArgs} args - Arguments to update one Party.
     * @example
     * // Update one Party
     * const party = await prisma.party.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PartyUpdateArgs>(args: SelectSubset<T, PartyUpdateArgs<ExtArgs>>): Prisma__PartyClient<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Parties.
     * @param {PartyDeleteManyArgs} args - Arguments to filter Parties to delete.
     * @example
     * // Delete a few Parties
     * const { count } = await prisma.party.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PartyDeleteManyArgs>(args?: SelectSubset<T, PartyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Parties.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PartyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Parties
     * const party = await prisma.party.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PartyUpdateManyArgs>(args: SelectSubset<T, PartyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Parties and returns the data updated in the database.
     * @param {PartyUpdateManyAndReturnArgs} args - Arguments to update many Parties.
     * @example
     * // Update many Parties
     * const party = await prisma.party.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Parties and only return the `id`
     * const partyWithIdOnly = await prisma.party.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PartyUpdateManyAndReturnArgs>(args: SelectSubset<T, PartyUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Party.
     * @param {PartyUpsertArgs} args - Arguments to update or create a Party.
     * @example
     * // Update or create a Party
     * const party = await prisma.party.upsert({
     *   create: {
     *     // ... data to create a Party
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Party we want to update
     *   }
     * })
     */
    upsert<T extends PartyUpsertArgs>(args: SelectSubset<T, PartyUpsertArgs<ExtArgs>>): Prisma__PartyClient<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Parties.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PartyCountArgs} args - Arguments to filter Parties to count.
     * @example
     * // Count the number of Parties
     * const count = await prisma.party.count({
     *   where: {
     *     // ... the filter for the Parties we want to count
     *   }
     * })
    **/
    count<T extends PartyCountArgs>(
      args?: Subset<T, PartyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PartyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Party.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PartyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PartyAggregateArgs>(args: Subset<T, PartyAggregateArgs>): Prisma.PrismaPromise<GetPartyAggregateType<T>>

    /**
     * Group by Party.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PartyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PartyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PartyGroupByArgs['orderBy'] }
        : { orderBy?: PartyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PartyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPartyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Party model
   */
  readonly fields: PartyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Party.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PartyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    transactions<T extends Party$transactionsArgs<ExtArgs> = {}>(args?: Subset<T, Party$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    ledgerEntries<T extends Party$ledgerEntriesArgs<ExtArgs> = {}>(args?: Subset<T, Party$ledgerEntriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    suppliedProducts<T extends Party$suppliedProductsArgs<ExtArgs> = {}>(args?: Subset<T, Party$suppliedProductsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Party model
   */
  interface PartyFieldRefs {
    readonly id: FieldRef<"Party", 'String'>
    readonly type: FieldRef<"Party", 'PartyType'>
    readonly name: FieldRef<"Party", 'String'>
    readonly gstin: FieldRef<"Party", 'String'>
    readonly pan: FieldRef<"Party", 'String'>
    readonly address: FieldRef<"Party", 'String'>
    readonly state: FieldRef<"Party", 'String'>
    readonly contactInfo: FieldRef<"Party", 'String'>
    readonly creditPeriod: FieldRef<"Party", 'Int'>
    readonly creditLimit: FieldRef<"Party", 'Float'>
    readonly openingBalance: FieldRef<"Party", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * Party findUnique
   */
  export type PartyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
    /**
     * Filter, which Party to fetch.
     */
    where: PartyWhereUniqueInput
  }

  /**
   * Party findUniqueOrThrow
   */
  export type PartyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
    /**
     * Filter, which Party to fetch.
     */
    where: PartyWhereUniqueInput
  }

  /**
   * Party findFirst
   */
  export type PartyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
    /**
     * Filter, which Party to fetch.
     */
    where?: PartyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Parties to fetch.
     */
    orderBy?: PartyOrderByWithRelationInput | PartyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Parties.
     */
    cursor?: PartyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Parties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Parties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Parties.
     */
    distinct?: PartyScalarFieldEnum | PartyScalarFieldEnum[]
  }

  /**
   * Party findFirstOrThrow
   */
  export type PartyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
    /**
     * Filter, which Party to fetch.
     */
    where?: PartyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Parties to fetch.
     */
    orderBy?: PartyOrderByWithRelationInput | PartyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Parties.
     */
    cursor?: PartyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Parties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Parties.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Parties.
     */
    distinct?: PartyScalarFieldEnum | PartyScalarFieldEnum[]
  }

  /**
   * Party findMany
   */
  export type PartyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
    /**
     * Filter, which Parties to fetch.
     */
    where?: PartyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Parties to fetch.
     */
    orderBy?: PartyOrderByWithRelationInput | PartyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Parties.
     */
    cursor?: PartyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Parties from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Parties.
     */
    skip?: number
    distinct?: PartyScalarFieldEnum | PartyScalarFieldEnum[]
  }

  /**
   * Party create
   */
  export type PartyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
    /**
     * The data needed to create a Party.
     */
    data: XOR<PartyCreateInput, PartyUncheckedCreateInput>
  }

  /**
   * Party createMany
   */
  export type PartyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Parties.
     */
    data: PartyCreateManyInput | PartyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Party createManyAndReturn
   */
  export type PartyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * The data used to create many Parties.
     */
    data: PartyCreateManyInput | PartyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Party update
   */
  export type PartyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
    /**
     * The data needed to update a Party.
     */
    data: XOR<PartyUpdateInput, PartyUncheckedUpdateInput>
    /**
     * Choose, which Party to update.
     */
    where: PartyWhereUniqueInput
  }

  /**
   * Party updateMany
   */
  export type PartyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Parties.
     */
    data: XOR<PartyUpdateManyMutationInput, PartyUncheckedUpdateManyInput>
    /**
     * Filter which Parties to update
     */
    where?: PartyWhereInput
    /**
     * Limit how many Parties to update.
     */
    limit?: number
  }

  /**
   * Party updateManyAndReturn
   */
  export type PartyUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * The data used to update Parties.
     */
    data: XOR<PartyUpdateManyMutationInput, PartyUncheckedUpdateManyInput>
    /**
     * Filter which Parties to update
     */
    where?: PartyWhereInput
    /**
     * Limit how many Parties to update.
     */
    limit?: number
  }

  /**
   * Party upsert
   */
  export type PartyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
    /**
     * The filter to search for the Party to update in case it exists.
     */
    where: PartyWhereUniqueInput
    /**
     * In case the Party found by the `where` argument doesn't exist, create a new Party with this data.
     */
    create: XOR<PartyCreateInput, PartyUncheckedCreateInput>
    /**
     * In case the Party was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PartyUpdateInput, PartyUncheckedUpdateInput>
  }

  /**
   * Party delete
   */
  export type PartyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
    /**
     * Filter which Party to delete.
     */
    where: PartyWhereUniqueInput
  }

  /**
   * Party deleteMany
   */
  export type PartyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Parties to delete
     */
    where?: PartyWhereInput
    /**
     * Limit how many Parties to delete.
     */
    limit?: number
  }

  /**
   * Party.transactions
   */
  export type Party$transactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    cursor?: TransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Party.ledgerEntries
   */
  export type Party$ledgerEntriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    where?: LedgerEntryWhereInput
    orderBy?: LedgerEntryOrderByWithRelationInput | LedgerEntryOrderByWithRelationInput[]
    cursor?: LedgerEntryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LedgerEntryScalarFieldEnum | LedgerEntryScalarFieldEnum[]
  }

  /**
   * Party.suppliedProducts
   */
  export type Party$suppliedProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
    where?: VendorProductWhereInput
    orderBy?: VendorProductOrderByWithRelationInput | VendorProductOrderByWithRelationInput[]
    cursor?: VendorProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VendorProductScalarFieldEnum | VendorProductScalarFieldEnum[]
  }

  /**
   * Party without action
   */
  export type PartyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
  }


  /**
   * Model Transaction
   */

  export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  export type TransactionAvgAggregateOutputType = {
    totalTaxable: number | null
    totalTax: number | null
    freightCost: number | null
    grandTotal: number | null
  }

  export type TransactionSumAggregateOutputType = {
    totalTaxable: number | null
    totalTax: number | null
    freightCost: number | null
    grandTotal: number | null
  }

  export type TransactionMinAggregateOutputType = {
    id: string | null
    type: $Enums.TxType | null
    txnNumber: string | null
    date: Date | null
    partyId: string | null
    fromLocationId: string | null
    toLocationId: string | null
    totalTaxable: number | null
    totalTax: number | null
    freightCost: number | null
    grandTotal: number | null
    status: string | null
    parentId: string | null
  }

  export type TransactionMaxAggregateOutputType = {
    id: string | null
    type: $Enums.TxType | null
    txnNumber: string | null
    date: Date | null
    partyId: string | null
    fromLocationId: string | null
    toLocationId: string | null
    totalTaxable: number | null
    totalTax: number | null
    freightCost: number | null
    grandTotal: number | null
    status: string | null
    parentId: string | null
  }

  export type TransactionCountAggregateOutputType = {
    id: number
    type: number
    txnNumber: number
    date: number
    partyId: number
    fromLocationId: number
    toLocationId: number
    totalTaxable: number
    totalTax: number
    freightCost: number
    grandTotal: number
    status: number
    parentId: number
    _all: number
  }


  export type TransactionAvgAggregateInputType = {
    totalTaxable?: true
    totalTax?: true
    freightCost?: true
    grandTotal?: true
  }

  export type TransactionSumAggregateInputType = {
    totalTaxable?: true
    totalTax?: true
    freightCost?: true
    grandTotal?: true
  }

  export type TransactionMinAggregateInputType = {
    id?: true
    type?: true
    txnNumber?: true
    date?: true
    partyId?: true
    fromLocationId?: true
    toLocationId?: true
    totalTaxable?: true
    totalTax?: true
    freightCost?: true
    grandTotal?: true
    status?: true
    parentId?: true
  }

  export type TransactionMaxAggregateInputType = {
    id?: true
    type?: true
    txnNumber?: true
    date?: true
    partyId?: true
    fromLocationId?: true
    toLocationId?: true
    totalTaxable?: true
    totalTax?: true
    freightCost?: true
    grandTotal?: true
    status?: true
    parentId?: true
  }

  export type TransactionCountAggregateInputType = {
    id?: true
    type?: true
    txnNumber?: true
    date?: true
    partyId?: true
    fromLocationId?: true
    toLocationId?: true
    totalTaxable?: true
    totalTax?: true
    freightCost?: true
    grandTotal?: true
    status?: true
    parentId?: true
    _all?: true
  }

  export type TransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Transactions
    **/
    _count?: true | TransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransactionMaxAggregateInputType
  }

  export type GetTransactionAggregateType<T extends TransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransaction[P]>
      : GetScalarType<T[P], AggregateTransaction[P]>
  }




  export type TransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithAggregationInput | TransactionOrderByWithAggregationInput[]
    by: TransactionScalarFieldEnum[] | TransactionScalarFieldEnum
    having?: TransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransactionCountAggregateInputType | true
    _avg?: TransactionAvgAggregateInputType
    _sum?: TransactionSumAggregateInputType
    _min?: TransactionMinAggregateInputType
    _max?: TransactionMaxAggregateInputType
  }

  export type TransactionGroupByOutputType = {
    id: string
    type: $Enums.TxType
    txnNumber: string
    date: Date
    partyId: string | null
    fromLocationId: string | null
    toLocationId: string | null
    totalTaxable: number
    totalTax: number
    freightCost: number | null
    grandTotal: number
    status: string
    parentId: string | null
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionGroupByOutputType[P]>
        }
      >
    >


  export type TransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    txnNumber?: boolean
    date?: boolean
    partyId?: boolean
    fromLocationId?: boolean
    toLocationId?: boolean
    totalTaxable?: boolean
    totalTax?: boolean
    freightCost?: boolean
    grandTotal?: boolean
    status?: boolean
    parentId?: boolean
    party?: boolean | Transaction$partyArgs<ExtArgs>
    parent?: boolean | Transaction$parentArgs<ExtArgs>
    children?: boolean | Transaction$childrenArgs<ExtArgs>
    items?: boolean | Transaction$itemsArgs<ExtArgs>
    ledgerEntries?: boolean | Transaction$ledgerEntriesArgs<ExtArgs>
    _count?: boolean | TransactionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    txnNumber?: boolean
    date?: boolean
    partyId?: boolean
    fromLocationId?: boolean
    toLocationId?: boolean
    totalTaxable?: boolean
    totalTax?: boolean
    freightCost?: boolean
    grandTotal?: boolean
    status?: boolean
    parentId?: boolean
    party?: boolean | Transaction$partyArgs<ExtArgs>
    parent?: boolean | Transaction$parentArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    txnNumber?: boolean
    date?: boolean
    partyId?: boolean
    fromLocationId?: boolean
    toLocationId?: boolean
    totalTaxable?: boolean
    totalTax?: boolean
    freightCost?: boolean
    grandTotal?: boolean
    status?: boolean
    parentId?: boolean
    party?: boolean | Transaction$partyArgs<ExtArgs>
    parent?: boolean | Transaction$parentArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectScalar = {
    id?: boolean
    type?: boolean
    txnNumber?: boolean
    date?: boolean
    partyId?: boolean
    fromLocationId?: boolean
    toLocationId?: boolean
    totalTaxable?: boolean
    totalTax?: boolean
    freightCost?: boolean
    grandTotal?: boolean
    status?: boolean
    parentId?: boolean
  }

  export type TransactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "type" | "txnNumber" | "date" | "partyId" | "fromLocationId" | "toLocationId" | "totalTaxable" | "totalTax" | "freightCost" | "grandTotal" | "status" | "parentId", ExtArgs["result"]["transaction"]>
  export type TransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    party?: boolean | Transaction$partyArgs<ExtArgs>
    parent?: boolean | Transaction$parentArgs<ExtArgs>
    children?: boolean | Transaction$childrenArgs<ExtArgs>
    items?: boolean | Transaction$itemsArgs<ExtArgs>
    ledgerEntries?: boolean | Transaction$ledgerEntriesArgs<ExtArgs>
    _count?: boolean | TransactionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    party?: boolean | Transaction$partyArgs<ExtArgs>
    parent?: boolean | Transaction$parentArgs<ExtArgs>
  }
  export type TransactionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    party?: boolean | Transaction$partyArgs<ExtArgs>
    parent?: boolean | Transaction$parentArgs<ExtArgs>
  }

  export type $TransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Transaction"
    objects: {
      party: Prisma.$PartyPayload<ExtArgs> | null
      parent: Prisma.$TransactionPayload<ExtArgs> | null
      children: Prisma.$TransactionPayload<ExtArgs>[]
      items: Prisma.$TransactionItemPayload<ExtArgs>[]
      ledgerEntries: Prisma.$LedgerEntryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: $Enums.TxType
      txnNumber: string
      date: Date
      partyId: string | null
      fromLocationId: string | null
      toLocationId: string | null
      totalTaxable: number
      totalTax: number
      freightCost: number | null
      grandTotal: number
      status: string
      parentId: string | null
    }, ExtArgs["result"]["transaction"]>
    composites: {}
  }

  type TransactionGetPayload<S extends boolean | null | undefined | TransactionDefaultArgs> = $Result.GetResult<Prisma.$TransactionPayload, S>

  type TransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TransactionCountAggregateInputType | true
    }

  export interface TransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Transaction'], meta: { name: 'Transaction' } }
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(args: SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(args?: SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     * 
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransactionFindManyArgs>(args?: SelectSubset<T, TransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     * 
     */
    create<T extends TransactionCreateArgs>(args: SelectSubset<T, TransactionCreateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransactionCreateManyArgs>(args?: SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     * 
     */
    delete<T extends TransactionDeleteArgs>(args: SelectSubset<T, TransactionDeleteArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransactionUpdateArgs>(args: SelectSubset<T, TransactionUpdateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransactionDeleteManyArgs>(args?: SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransactionUpdateManyArgs>(args: SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions and returns the data updated in the database.
     * @param {TransactionUpdateManyAndReturnArgs} args - Arguments to update many Transactions.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TransactionUpdateManyAndReturnArgs>(args: SelectSubset<T, TransactionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(args: SelectSubset<T, TransactionUpsertArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
    **/
    count<T extends TransactionCountArgs>(
      args?: Subset<T, TransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TransactionAggregateArgs>(args: Subset<T, TransactionAggregateArgs>): Prisma.PrismaPromise<GetTransactionAggregateType<T>>

    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionGroupByArgs['orderBy'] }
        : { orderBy?: TransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Transaction model
   */
  readonly fields: TransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    party<T extends Transaction$partyArgs<ExtArgs> = {}>(args?: Subset<T, Transaction$partyArgs<ExtArgs>>): Prisma__PartyClient<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    parent<T extends Transaction$parentArgs<ExtArgs> = {}>(args?: Subset<T, Transaction$parentArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    children<T extends Transaction$childrenArgs<ExtArgs> = {}>(args?: Subset<T, Transaction$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    items<T extends Transaction$itemsArgs<ExtArgs> = {}>(args?: Subset<T, Transaction$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    ledgerEntries<T extends Transaction$ledgerEntriesArgs<ExtArgs> = {}>(args?: Subset<T, Transaction$ledgerEntriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Transaction model
   */
  interface TransactionFieldRefs {
    readonly id: FieldRef<"Transaction", 'String'>
    readonly type: FieldRef<"Transaction", 'TxType'>
    readonly txnNumber: FieldRef<"Transaction", 'String'>
    readonly date: FieldRef<"Transaction", 'DateTime'>
    readonly partyId: FieldRef<"Transaction", 'String'>
    readonly fromLocationId: FieldRef<"Transaction", 'String'>
    readonly toLocationId: FieldRef<"Transaction", 'String'>
    readonly totalTaxable: FieldRef<"Transaction", 'Float'>
    readonly totalTax: FieldRef<"Transaction", 'Float'>
    readonly freightCost: FieldRef<"Transaction", 'Float'>
    readonly grandTotal: FieldRef<"Transaction", 'Float'>
    readonly status: FieldRef<"Transaction", 'String'>
    readonly parentId: FieldRef<"Transaction", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Transaction findUnique
   */
  export type TransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findUniqueOrThrow
   */
  export type TransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findFirst
   */
  export type TransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findFirstOrThrow
   */
  export type TransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findMany
   */
  export type TransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transactions to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction create
   */
  export type TransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a Transaction.
     */
    data: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
  }

  /**
   * Transaction createMany
   */
  export type TransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Transaction createManyAndReturn
   */
  export type TransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction update
   */
  export type TransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a Transaction.
     */
    data: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
    /**
     * Choose, which Transaction to update.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction updateMany
   */
  export type TransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
  }

  /**
   * Transaction updateManyAndReturn
   */
  export type TransactionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Transaction upsert
   */
  export type TransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: TransactionWhereUniqueInput
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
  }

  /**
   * Transaction delete
   */
  export type TransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter which Transaction to delete.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction deleteMany
   */
  export type TransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transactions to delete
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to delete.
     */
    limit?: number
  }

  /**
   * Transaction.party
   */
  export type Transaction$partyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
    where?: PartyWhereInput
  }

  /**
   * Transaction.parent
   */
  export type Transaction$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
  }

  /**
   * Transaction.children
   */
  export type Transaction$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    cursor?: TransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction.items
   */
  export type Transaction$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    where?: TransactionItemWhereInput
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    cursor?: TransactionItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionItemScalarFieldEnum | TransactionItemScalarFieldEnum[]
  }

  /**
   * Transaction.ledgerEntries
   */
  export type Transaction$ledgerEntriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    where?: LedgerEntryWhereInput
    orderBy?: LedgerEntryOrderByWithRelationInput | LedgerEntryOrderByWithRelationInput[]
    cursor?: LedgerEntryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LedgerEntryScalarFieldEnum | LedgerEntryScalarFieldEnum[]
  }

  /**
   * Transaction without action
   */
  export type TransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
  }


  /**
   * Model TransactionItem
   */

  export type AggregateTransactionItem = {
    _count: TransactionItemCountAggregateOutputType | null
    _avg: TransactionItemAvgAggregateOutputType | null
    _sum: TransactionItemSumAggregateOutputType | null
    _min: TransactionItemMinAggregateOutputType | null
    _max: TransactionItemMaxAggregateOutputType | null
  }

  export type TransactionItemAvgAggregateOutputType = {
    quantity: number | null
    rate: number | null
    freightFraction: number | null
    taxableValue: number | null
    cgst: number | null
    sgst: number | null
    igst: number | null
  }

  export type TransactionItemSumAggregateOutputType = {
    quantity: number | null
    rate: number | null
    freightFraction: number | null
    taxableValue: number | null
    cgst: number | null
    sgst: number | null
    igst: number | null
  }

  export type TransactionItemMinAggregateOutputType = {
    id: string | null
    transactionId: string | null
    variantId: string | null
    quantity: number | null
    rate: number | null
    freightFraction: number | null
    taxableValue: number | null
    cgst: number | null
    sgst: number | null
    igst: number | null
  }

  export type TransactionItemMaxAggregateOutputType = {
    id: string | null
    transactionId: string | null
    variantId: string | null
    quantity: number | null
    rate: number | null
    freightFraction: number | null
    taxableValue: number | null
    cgst: number | null
    sgst: number | null
    igst: number | null
  }

  export type TransactionItemCountAggregateOutputType = {
    id: number
    transactionId: number
    variantId: number
    quantity: number
    rate: number
    freightFraction: number
    taxableValue: number
    cgst: number
    sgst: number
    igst: number
    _all: number
  }


  export type TransactionItemAvgAggregateInputType = {
    quantity?: true
    rate?: true
    freightFraction?: true
    taxableValue?: true
    cgst?: true
    sgst?: true
    igst?: true
  }

  export type TransactionItemSumAggregateInputType = {
    quantity?: true
    rate?: true
    freightFraction?: true
    taxableValue?: true
    cgst?: true
    sgst?: true
    igst?: true
  }

  export type TransactionItemMinAggregateInputType = {
    id?: true
    transactionId?: true
    variantId?: true
    quantity?: true
    rate?: true
    freightFraction?: true
    taxableValue?: true
    cgst?: true
    sgst?: true
    igst?: true
  }

  export type TransactionItemMaxAggregateInputType = {
    id?: true
    transactionId?: true
    variantId?: true
    quantity?: true
    rate?: true
    freightFraction?: true
    taxableValue?: true
    cgst?: true
    sgst?: true
    igst?: true
  }

  export type TransactionItemCountAggregateInputType = {
    id?: true
    transactionId?: true
    variantId?: true
    quantity?: true
    rate?: true
    freightFraction?: true
    taxableValue?: true
    cgst?: true
    sgst?: true
    igst?: true
    _all?: true
  }

  export type TransactionItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TransactionItem to aggregate.
     */
    where?: TransactionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionItems to fetch.
     */
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransactionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TransactionItems
    **/
    _count?: true | TransactionItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TransactionItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TransactionItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransactionItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransactionItemMaxAggregateInputType
  }

  export type GetTransactionItemAggregateType<T extends TransactionItemAggregateArgs> = {
        [P in keyof T & keyof AggregateTransactionItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransactionItem[P]>
      : GetScalarType<T[P], AggregateTransactionItem[P]>
  }




  export type TransactionItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionItemWhereInput
    orderBy?: TransactionItemOrderByWithAggregationInput | TransactionItemOrderByWithAggregationInput[]
    by: TransactionItemScalarFieldEnum[] | TransactionItemScalarFieldEnum
    having?: TransactionItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransactionItemCountAggregateInputType | true
    _avg?: TransactionItemAvgAggregateInputType
    _sum?: TransactionItemSumAggregateInputType
    _min?: TransactionItemMinAggregateInputType
    _max?: TransactionItemMaxAggregateInputType
  }

  export type TransactionItemGroupByOutputType = {
    id: string
    transactionId: string
    variantId: string
    quantity: number
    rate: number
    freightFraction: number | null
    taxableValue: number
    cgst: number
    sgst: number
    igst: number
    _count: TransactionItemCountAggregateOutputType | null
    _avg: TransactionItemAvgAggregateOutputType | null
    _sum: TransactionItemSumAggregateOutputType | null
    _min: TransactionItemMinAggregateOutputType | null
    _max: TransactionItemMaxAggregateOutputType | null
  }

  type GetTransactionItemGroupByPayload<T extends TransactionItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransactionItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionItemGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionItemGroupByOutputType[P]>
        }
      >
    >


  export type TransactionItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    transactionId?: boolean
    variantId?: boolean
    quantity?: boolean
    rate?: boolean
    freightFraction?: boolean
    taxableValue?: boolean
    cgst?: boolean
    sgst?: boolean
    igst?: boolean
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transactionItem"]>

  export type TransactionItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    transactionId?: boolean
    variantId?: boolean
    quantity?: boolean
    rate?: boolean
    freightFraction?: boolean
    taxableValue?: boolean
    cgst?: boolean
    sgst?: boolean
    igst?: boolean
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transactionItem"]>

  export type TransactionItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    transactionId?: boolean
    variantId?: boolean
    quantity?: boolean
    rate?: boolean
    freightFraction?: boolean
    taxableValue?: boolean
    cgst?: boolean
    sgst?: boolean
    igst?: boolean
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transactionItem"]>

  export type TransactionItemSelectScalar = {
    id?: boolean
    transactionId?: boolean
    variantId?: boolean
    quantity?: boolean
    rate?: boolean
    freightFraction?: boolean
    taxableValue?: boolean
    cgst?: boolean
    sgst?: boolean
    igst?: boolean
  }

  export type TransactionItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "transactionId" | "variantId" | "quantity" | "rate" | "freightFraction" | "taxableValue" | "cgst" | "sgst" | "igst", ExtArgs["result"]["transactionItem"]>
  export type TransactionItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }
  export type TransactionItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }
  export type TransactionItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }

  export type $TransactionItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TransactionItem"
    objects: {
      transaction: Prisma.$TransactionPayload<ExtArgs>
      variant: Prisma.$VariantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      transactionId: string
      variantId: string
      quantity: number
      rate: number
      freightFraction: number | null
      taxableValue: number
      cgst: number
      sgst: number
      igst: number
    }, ExtArgs["result"]["transactionItem"]>
    composites: {}
  }

  type TransactionItemGetPayload<S extends boolean | null | undefined | TransactionItemDefaultArgs> = $Result.GetResult<Prisma.$TransactionItemPayload, S>

  type TransactionItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TransactionItemCountAggregateInputType | true
    }

  export interface TransactionItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TransactionItem'], meta: { name: 'TransactionItem' } }
    /**
     * Find zero or one TransactionItem that matches the filter.
     * @param {TransactionItemFindUniqueArgs} args - Arguments to find a TransactionItem
     * @example
     * // Get one TransactionItem
     * const transactionItem = await prisma.transactionItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionItemFindUniqueArgs>(args: SelectSubset<T, TransactionItemFindUniqueArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TransactionItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionItemFindUniqueOrThrowArgs} args - Arguments to find a TransactionItem
     * @example
     * // Get one TransactionItem
     * const transactionItem = await prisma.transactionItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionItemFindUniqueOrThrowArgs>(args: SelectSubset<T, TransactionItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TransactionItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemFindFirstArgs} args - Arguments to find a TransactionItem
     * @example
     * // Get one TransactionItem
     * const transactionItem = await prisma.transactionItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionItemFindFirstArgs>(args?: SelectSubset<T, TransactionItemFindFirstArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TransactionItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemFindFirstOrThrowArgs} args - Arguments to find a TransactionItem
     * @example
     * // Get one TransactionItem
     * const transactionItem = await prisma.transactionItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionItemFindFirstOrThrowArgs>(args?: SelectSubset<T, TransactionItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TransactionItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TransactionItems
     * const transactionItems = await prisma.transactionItem.findMany()
     * 
     * // Get first 10 TransactionItems
     * const transactionItems = await prisma.transactionItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transactionItemWithIdOnly = await prisma.transactionItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransactionItemFindManyArgs>(args?: SelectSubset<T, TransactionItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TransactionItem.
     * @param {TransactionItemCreateArgs} args - Arguments to create a TransactionItem.
     * @example
     * // Create one TransactionItem
     * const TransactionItem = await prisma.transactionItem.create({
     *   data: {
     *     // ... data to create a TransactionItem
     *   }
     * })
     * 
     */
    create<T extends TransactionItemCreateArgs>(args: SelectSubset<T, TransactionItemCreateArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TransactionItems.
     * @param {TransactionItemCreateManyArgs} args - Arguments to create many TransactionItems.
     * @example
     * // Create many TransactionItems
     * const transactionItem = await prisma.transactionItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransactionItemCreateManyArgs>(args?: SelectSubset<T, TransactionItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TransactionItems and returns the data saved in the database.
     * @param {TransactionItemCreateManyAndReturnArgs} args - Arguments to create many TransactionItems.
     * @example
     * // Create many TransactionItems
     * const transactionItem = await prisma.transactionItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TransactionItems and only return the `id`
     * const transactionItemWithIdOnly = await prisma.transactionItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransactionItemCreateManyAndReturnArgs>(args?: SelectSubset<T, TransactionItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TransactionItem.
     * @param {TransactionItemDeleteArgs} args - Arguments to delete one TransactionItem.
     * @example
     * // Delete one TransactionItem
     * const TransactionItem = await prisma.transactionItem.delete({
     *   where: {
     *     // ... filter to delete one TransactionItem
     *   }
     * })
     * 
     */
    delete<T extends TransactionItemDeleteArgs>(args: SelectSubset<T, TransactionItemDeleteArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TransactionItem.
     * @param {TransactionItemUpdateArgs} args - Arguments to update one TransactionItem.
     * @example
     * // Update one TransactionItem
     * const transactionItem = await prisma.transactionItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransactionItemUpdateArgs>(args: SelectSubset<T, TransactionItemUpdateArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TransactionItems.
     * @param {TransactionItemDeleteManyArgs} args - Arguments to filter TransactionItems to delete.
     * @example
     * // Delete a few TransactionItems
     * const { count } = await prisma.transactionItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransactionItemDeleteManyArgs>(args?: SelectSubset<T, TransactionItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TransactionItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TransactionItems
     * const transactionItem = await prisma.transactionItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransactionItemUpdateManyArgs>(args: SelectSubset<T, TransactionItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TransactionItems and returns the data updated in the database.
     * @param {TransactionItemUpdateManyAndReturnArgs} args - Arguments to update many TransactionItems.
     * @example
     * // Update many TransactionItems
     * const transactionItem = await prisma.transactionItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TransactionItems and only return the `id`
     * const transactionItemWithIdOnly = await prisma.transactionItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TransactionItemUpdateManyAndReturnArgs>(args: SelectSubset<T, TransactionItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TransactionItem.
     * @param {TransactionItemUpsertArgs} args - Arguments to update or create a TransactionItem.
     * @example
     * // Update or create a TransactionItem
     * const transactionItem = await prisma.transactionItem.upsert({
     *   create: {
     *     // ... data to create a TransactionItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TransactionItem we want to update
     *   }
     * })
     */
    upsert<T extends TransactionItemUpsertArgs>(args: SelectSubset<T, TransactionItemUpsertArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TransactionItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemCountArgs} args - Arguments to filter TransactionItems to count.
     * @example
     * // Count the number of TransactionItems
     * const count = await prisma.transactionItem.count({
     *   where: {
     *     // ... the filter for the TransactionItems we want to count
     *   }
     * })
    **/
    count<T extends TransactionItemCountArgs>(
      args?: Subset<T, TransactionItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TransactionItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TransactionItemAggregateArgs>(args: Subset<T, TransactionItemAggregateArgs>): Prisma.PrismaPromise<GetTransactionItemAggregateType<T>>

    /**
     * Group by TransactionItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TransactionItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionItemGroupByArgs['orderBy'] }
        : { orderBy?: TransactionItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TransactionItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TransactionItem model
   */
  readonly fields: TransactionItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TransactionItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    transaction<T extends TransactionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TransactionDefaultArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    variant<T extends VariantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VariantDefaultArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TransactionItem model
   */
  interface TransactionItemFieldRefs {
    readonly id: FieldRef<"TransactionItem", 'String'>
    readonly transactionId: FieldRef<"TransactionItem", 'String'>
    readonly variantId: FieldRef<"TransactionItem", 'String'>
    readonly quantity: FieldRef<"TransactionItem", 'Float'>
    readonly rate: FieldRef<"TransactionItem", 'Float'>
    readonly freightFraction: FieldRef<"TransactionItem", 'Float'>
    readonly taxableValue: FieldRef<"TransactionItem", 'Float'>
    readonly cgst: FieldRef<"TransactionItem", 'Float'>
    readonly sgst: FieldRef<"TransactionItem", 'Float'>
    readonly igst: FieldRef<"TransactionItem", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * TransactionItem findUnique
   */
  export type TransactionItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter, which TransactionItem to fetch.
     */
    where: TransactionItemWhereUniqueInput
  }

  /**
   * TransactionItem findUniqueOrThrow
   */
  export type TransactionItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter, which TransactionItem to fetch.
     */
    where: TransactionItemWhereUniqueInput
  }

  /**
   * TransactionItem findFirst
   */
  export type TransactionItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter, which TransactionItem to fetch.
     */
    where?: TransactionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionItems to fetch.
     */
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TransactionItems.
     */
    cursor?: TransactionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TransactionItems.
     */
    distinct?: TransactionItemScalarFieldEnum | TransactionItemScalarFieldEnum[]
  }

  /**
   * TransactionItem findFirstOrThrow
   */
  export type TransactionItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter, which TransactionItem to fetch.
     */
    where?: TransactionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionItems to fetch.
     */
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TransactionItems.
     */
    cursor?: TransactionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TransactionItems.
     */
    distinct?: TransactionItemScalarFieldEnum | TransactionItemScalarFieldEnum[]
  }

  /**
   * TransactionItem findMany
   */
  export type TransactionItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter, which TransactionItems to fetch.
     */
    where?: TransactionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionItems to fetch.
     */
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TransactionItems.
     */
    cursor?: TransactionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionItems.
     */
    skip?: number
    distinct?: TransactionItemScalarFieldEnum | TransactionItemScalarFieldEnum[]
  }

  /**
   * TransactionItem create
   */
  export type TransactionItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * The data needed to create a TransactionItem.
     */
    data: XOR<TransactionItemCreateInput, TransactionItemUncheckedCreateInput>
  }

  /**
   * TransactionItem createMany
   */
  export type TransactionItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TransactionItems.
     */
    data: TransactionItemCreateManyInput | TransactionItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TransactionItem createManyAndReturn
   */
  export type TransactionItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * The data used to create many TransactionItems.
     */
    data: TransactionItemCreateManyInput | TransactionItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TransactionItem update
   */
  export type TransactionItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * The data needed to update a TransactionItem.
     */
    data: XOR<TransactionItemUpdateInput, TransactionItemUncheckedUpdateInput>
    /**
     * Choose, which TransactionItem to update.
     */
    where: TransactionItemWhereUniqueInput
  }

  /**
   * TransactionItem updateMany
   */
  export type TransactionItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TransactionItems.
     */
    data: XOR<TransactionItemUpdateManyMutationInput, TransactionItemUncheckedUpdateManyInput>
    /**
     * Filter which TransactionItems to update
     */
    where?: TransactionItemWhereInput
    /**
     * Limit how many TransactionItems to update.
     */
    limit?: number
  }

  /**
   * TransactionItem updateManyAndReturn
   */
  export type TransactionItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * The data used to update TransactionItems.
     */
    data: XOR<TransactionItemUpdateManyMutationInput, TransactionItemUncheckedUpdateManyInput>
    /**
     * Filter which TransactionItems to update
     */
    where?: TransactionItemWhereInput
    /**
     * Limit how many TransactionItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TransactionItem upsert
   */
  export type TransactionItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * The filter to search for the TransactionItem to update in case it exists.
     */
    where: TransactionItemWhereUniqueInput
    /**
     * In case the TransactionItem found by the `where` argument doesn't exist, create a new TransactionItem with this data.
     */
    create: XOR<TransactionItemCreateInput, TransactionItemUncheckedCreateInput>
    /**
     * In case the TransactionItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionItemUpdateInput, TransactionItemUncheckedUpdateInput>
  }

  /**
   * TransactionItem delete
   */
  export type TransactionItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter which TransactionItem to delete.
     */
    where: TransactionItemWhereUniqueInput
  }

  /**
   * TransactionItem deleteMany
   */
  export type TransactionItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TransactionItems to delete
     */
    where?: TransactionItemWhereInput
    /**
     * Limit how many TransactionItems to delete.
     */
    limit?: number
  }

  /**
   * TransactionItem without action
   */
  export type TransactionItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
  }


  /**
   * Model Account
   */

  export type AggregateAccount = {
    _count: AccountCountAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  export type AccountMinAggregateOutputType = {
    id: string | null
    code: string | null
    name: string | null
    group: $Enums.AccountGroup | null
    isSystem: boolean | null
  }

  export type AccountMaxAggregateOutputType = {
    id: string | null
    code: string | null
    name: string | null
    group: $Enums.AccountGroup | null
    isSystem: boolean | null
  }

  export type AccountCountAggregateOutputType = {
    id: number
    code: number
    name: number
    group: number
    isSystem: number
    _all: number
  }


  export type AccountMinAggregateInputType = {
    id?: true
    code?: true
    name?: true
    group?: true
    isSystem?: true
  }

  export type AccountMaxAggregateInputType = {
    id?: true
    code?: true
    name?: true
    group?: true
    isSystem?: true
  }

  export type AccountCountAggregateInputType = {
    id?: true
    code?: true
    name?: true
    group?: true
    isSystem?: true
    _all?: true
  }

  export type AccountAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Account to aggregate.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Accounts
    **/
    _count?: true | AccountCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountMaxAggregateInputType
  }

  export type GetAccountAggregateType<T extends AccountAggregateArgs> = {
        [P in keyof T & keyof AggregateAccount]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccount[P]>
      : GetScalarType<T[P], AggregateAccount[P]>
  }




  export type AccountGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AccountWhereInput
    orderBy?: AccountOrderByWithAggregationInput | AccountOrderByWithAggregationInput[]
    by: AccountScalarFieldEnum[] | AccountScalarFieldEnum
    having?: AccountScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountCountAggregateInputType | true
    _min?: AccountMinAggregateInputType
    _max?: AccountMaxAggregateInputType
  }

  export type AccountGroupByOutputType = {
    id: string
    code: string
    name: string
    group: $Enums.AccountGroup
    isSystem: boolean
    _count: AccountCountAggregateOutputType | null
    _min: AccountMinAggregateOutputType | null
    _max: AccountMaxAggregateOutputType | null
  }

  type GetAccountGroupByPayload<T extends AccountGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AccountGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountGroupByOutputType[P]>
            : GetScalarType<T[P], AccountGroupByOutputType[P]>
        }
      >
    >


  export type AccountSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    group?: boolean
    isSystem?: boolean
    entries?: boolean | Account$entriesArgs<ExtArgs>
    _count?: boolean | AccountCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["account"]>

  export type AccountSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    group?: boolean
    isSystem?: boolean
  }, ExtArgs["result"]["account"]>

  export type AccountSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    group?: boolean
    isSystem?: boolean
  }, ExtArgs["result"]["account"]>

  export type AccountSelectScalar = {
    id?: boolean
    code?: boolean
    name?: boolean
    group?: boolean
    isSystem?: boolean
  }

  export type AccountOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "name" | "group" | "isSystem", ExtArgs["result"]["account"]>
  export type AccountInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    entries?: boolean | Account$entriesArgs<ExtArgs>
    _count?: boolean | AccountCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AccountIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type AccountIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AccountPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Account"
    objects: {
      entries: Prisma.$LedgerEntryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      code: string
      name: string
      group: $Enums.AccountGroup
      isSystem: boolean
    }, ExtArgs["result"]["account"]>
    composites: {}
  }

  type AccountGetPayload<S extends boolean | null | undefined | AccountDefaultArgs> = $Result.GetResult<Prisma.$AccountPayload, S>

  type AccountCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AccountFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AccountCountAggregateInputType | true
    }

  export interface AccountDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Account'], meta: { name: 'Account' } }
    /**
     * Find zero or one Account that matches the filter.
     * @param {AccountFindUniqueArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AccountFindUniqueArgs>(args: SelectSubset<T, AccountFindUniqueArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Account that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AccountFindUniqueOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AccountFindUniqueOrThrowArgs>(args: SelectSubset<T, AccountFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AccountFindFirstArgs>(args?: SelectSubset<T, AccountFindFirstArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Account that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindFirstOrThrowArgs} args - Arguments to find a Account
     * @example
     * // Get one Account
     * const account = await prisma.account.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AccountFindFirstOrThrowArgs>(args?: SelectSubset<T, AccountFindFirstOrThrowArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Accounts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Accounts
     * const accounts = await prisma.account.findMany()
     * 
     * // Get first 10 Accounts
     * const accounts = await prisma.account.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accountWithIdOnly = await prisma.account.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AccountFindManyArgs>(args?: SelectSubset<T, AccountFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Account.
     * @param {AccountCreateArgs} args - Arguments to create a Account.
     * @example
     * // Create one Account
     * const Account = await prisma.account.create({
     *   data: {
     *     // ... data to create a Account
     *   }
     * })
     * 
     */
    create<T extends AccountCreateArgs>(args: SelectSubset<T, AccountCreateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Accounts.
     * @param {AccountCreateManyArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AccountCreateManyArgs>(args?: SelectSubset<T, AccountCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Accounts and returns the data saved in the database.
     * @param {AccountCreateManyAndReturnArgs} args - Arguments to create many Accounts.
     * @example
     * // Create many Accounts
     * const account = await prisma.account.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AccountCreateManyAndReturnArgs>(args?: SelectSubset<T, AccountCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Account.
     * @param {AccountDeleteArgs} args - Arguments to delete one Account.
     * @example
     * // Delete one Account
     * const Account = await prisma.account.delete({
     *   where: {
     *     // ... filter to delete one Account
     *   }
     * })
     * 
     */
    delete<T extends AccountDeleteArgs>(args: SelectSubset<T, AccountDeleteArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Account.
     * @param {AccountUpdateArgs} args - Arguments to update one Account.
     * @example
     * // Update one Account
     * const account = await prisma.account.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AccountUpdateArgs>(args: SelectSubset<T, AccountUpdateArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Accounts.
     * @param {AccountDeleteManyArgs} args - Arguments to filter Accounts to delete.
     * @example
     * // Delete a few Accounts
     * const { count } = await prisma.account.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AccountDeleteManyArgs>(args?: SelectSubset<T, AccountDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AccountUpdateManyArgs>(args: SelectSubset<T, AccountUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Accounts and returns the data updated in the database.
     * @param {AccountUpdateManyAndReturnArgs} args - Arguments to update many Accounts.
     * @example
     * // Update many Accounts
     * const account = await prisma.account.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Accounts and only return the `id`
     * const accountWithIdOnly = await prisma.account.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AccountUpdateManyAndReturnArgs>(args: SelectSubset<T, AccountUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Account.
     * @param {AccountUpsertArgs} args - Arguments to update or create a Account.
     * @example
     * // Update or create a Account
     * const account = await prisma.account.upsert({
     *   create: {
     *     // ... data to create a Account
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Account we want to update
     *   }
     * })
     */
    upsert<T extends AccountUpsertArgs>(args: SelectSubset<T, AccountUpsertArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Accounts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountCountArgs} args - Arguments to filter Accounts to count.
     * @example
     * // Count the number of Accounts
     * const count = await prisma.account.count({
     *   where: {
     *     // ... the filter for the Accounts we want to count
     *   }
     * })
    **/
    count<T extends AccountCountArgs>(
      args?: Subset<T, AccountCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountAggregateArgs>(args: Subset<T, AccountAggregateArgs>): Prisma.PrismaPromise<GetAccountAggregateType<T>>

    /**
     * Group by Account.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountGroupByArgs['orderBy'] }
        : { orderBy?: AccountGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Account model
   */
  readonly fields: AccountFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Account.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AccountClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    entries<T extends Account$entriesArgs<ExtArgs> = {}>(args?: Subset<T, Account$entriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Account model
   */
  interface AccountFieldRefs {
    readonly id: FieldRef<"Account", 'String'>
    readonly code: FieldRef<"Account", 'String'>
    readonly name: FieldRef<"Account", 'String'>
    readonly group: FieldRef<"Account", 'AccountGroup'>
    readonly isSystem: FieldRef<"Account", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Account findUnique
   */
  export type AccountFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findUniqueOrThrow
   */
  export type AccountFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account findFirst
   */
  export type AccountFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findFirstOrThrow
   */
  export type AccountFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Account to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Accounts.
     */
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account findMany
   */
  export type AccountFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter, which Accounts to fetch.
     */
    where?: AccountWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Accounts to fetch.
     */
    orderBy?: AccountOrderByWithRelationInput | AccountOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Accounts.
     */
    cursor?: AccountWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Accounts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Accounts.
     */
    skip?: number
    distinct?: AccountScalarFieldEnum | AccountScalarFieldEnum[]
  }

  /**
   * Account create
   */
  export type AccountCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to create a Account.
     */
    data: XOR<AccountCreateInput, AccountUncheckedCreateInput>
  }

  /**
   * Account createMany
   */
  export type AccountCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Account createManyAndReturn
   */
  export type AccountCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to create many Accounts.
     */
    data: AccountCreateManyInput | AccountCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Account update
   */
  export type AccountUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The data needed to update a Account.
     */
    data: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
    /**
     * Choose, which Account to update.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account updateMany
   */
  export type AccountUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
  }

  /**
   * Account updateManyAndReturn
   */
  export type AccountUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * The data used to update Accounts.
     */
    data: XOR<AccountUpdateManyMutationInput, AccountUncheckedUpdateManyInput>
    /**
     * Filter which Accounts to update
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to update.
     */
    limit?: number
  }

  /**
   * Account upsert
   */
  export type AccountUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * The filter to search for the Account to update in case it exists.
     */
    where: AccountWhereUniqueInput
    /**
     * In case the Account found by the `where` argument doesn't exist, create a new Account with this data.
     */
    create: XOR<AccountCreateInput, AccountUncheckedCreateInput>
    /**
     * In case the Account was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AccountUpdateInput, AccountUncheckedUpdateInput>
  }

  /**
   * Account delete
   */
  export type AccountDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
    /**
     * Filter which Account to delete.
     */
    where: AccountWhereUniqueInput
  }

  /**
   * Account deleteMany
   */
  export type AccountDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Accounts to delete
     */
    where?: AccountWhereInput
    /**
     * Limit how many Accounts to delete.
     */
    limit?: number
  }

  /**
   * Account.entries
   */
  export type Account$entriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    where?: LedgerEntryWhereInput
    orderBy?: LedgerEntryOrderByWithRelationInput | LedgerEntryOrderByWithRelationInput[]
    cursor?: LedgerEntryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: LedgerEntryScalarFieldEnum | LedgerEntryScalarFieldEnum[]
  }

  /**
   * Account without action
   */
  export type AccountDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Account
     */
    select?: AccountSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Account
     */
    omit?: AccountOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AccountInclude<ExtArgs> | null
  }


  /**
   * Model LedgerEntry
   */

  export type AggregateLedgerEntry = {
    _count: LedgerEntryCountAggregateOutputType | null
    _avg: LedgerEntryAvgAggregateOutputType | null
    _sum: LedgerEntrySumAggregateOutputType | null
    _min: LedgerEntryMinAggregateOutputType | null
    _max: LedgerEntryMaxAggregateOutputType | null
  }

  export type LedgerEntryAvgAggregateOutputType = {
    debit: number | null
    credit: number | null
  }

  export type LedgerEntrySumAggregateOutputType = {
    debit: number | null
    credit: number | null
  }

  export type LedgerEntryMinAggregateOutputType = {
    id: string | null
    accountId: string | null
    partyId: string | null
    transactionId: string | null
    date: Date | null
    debit: number | null
    credit: number | null
    reference: string | null
    isReconciled: boolean | null
  }

  export type LedgerEntryMaxAggregateOutputType = {
    id: string | null
    accountId: string | null
    partyId: string | null
    transactionId: string | null
    date: Date | null
    debit: number | null
    credit: number | null
    reference: string | null
    isReconciled: boolean | null
  }

  export type LedgerEntryCountAggregateOutputType = {
    id: number
    accountId: number
    partyId: number
    transactionId: number
    date: number
    debit: number
    credit: number
    reference: number
    isReconciled: number
    _all: number
  }


  export type LedgerEntryAvgAggregateInputType = {
    debit?: true
    credit?: true
  }

  export type LedgerEntrySumAggregateInputType = {
    debit?: true
    credit?: true
  }

  export type LedgerEntryMinAggregateInputType = {
    id?: true
    accountId?: true
    partyId?: true
    transactionId?: true
    date?: true
    debit?: true
    credit?: true
    reference?: true
    isReconciled?: true
  }

  export type LedgerEntryMaxAggregateInputType = {
    id?: true
    accountId?: true
    partyId?: true
    transactionId?: true
    date?: true
    debit?: true
    credit?: true
    reference?: true
    isReconciled?: true
  }

  export type LedgerEntryCountAggregateInputType = {
    id?: true
    accountId?: true
    partyId?: true
    transactionId?: true
    date?: true
    debit?: true
    credit?: true
    reference?: true
    isReconciled?: true
    _all?: true
  }

  export type LedgerEntryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LedgerEntry to aggregate.
     */
    where?: LedgerEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LedgerEntries to fetch.
     */
    orderBy?: LedgerEntryOrderByWithRelationInput | LedgerEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LedgerEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LedgerEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LedgerEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LedgerEntries
    **/
    _count?: true | LedgerEntryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LedgerEntryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LedgerEntrySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LedgerEntryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LedgerEntryMaxAggregateInputType
  }

  export type GetLedgerEntryAggregateType<T extends LedgerEntryAggregateArgs> = {
        [P in keyof T & keyof AggregateLedgerEntry]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLedgerEntry[P]>
      : GetScalarType<T[P], AggregateLedgerEntry[P]>
  }




  export type LedgerEntryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LedgerEntryWhereInput
    orderBy?: LedgerEntryOrderByWithAggregationInput | LedgerEntryOrderByWithAggregationInput[]
    by: LedgerEntryScalarFieldEnum[] | LedgerEntryScalarFieldEnum
    having?: LedgerEntryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LedgerEntryCountAggregateInputType | true
    _avg?: LedgerEntryAvgAggregateInputType
    _sum?: LedgerEntrySumAggregateInputType
    _min?: LedgerEntryMinAggregateInputType
    _max?: LedgerEntryMaxAggregateInputType
  }

  export type LedgerEntryGroupByOutputType = {
    id: string
    accountId: string
    partyId: string | null
    transactionId: string | null
    date: Date
    debit: number
    credit: number
    reference: string | null
    isReconciled: boolean
    _count: LedgerEntryCountAggregateOutputType | null
    _avg: LedgerEntryAvgAggregateOutputType | null
    _sum: LedgerEntrySumAggregateOutputType | null
    _min: LedgerEntryMinAggregateOutputType | null
    _max: LedgerEntryMaxAggregateOutputType | null
  }

  type GetLedgerEntryGroupByPayload<T extends LedgerEntryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LedgerEntryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LedgerEntryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LedgerEntryGroupByOutputType[P]>
            : GetScalarType<T[P], LedgerEntryGroupByOutputType[P]>
        }
      >
    >


  export type LedgerEntrySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    partyId?: boolean
    transactionId?: boolean
    date?: boolean
    debit?: boolean
    credit?: boolean
    reference?: boolean
    isReconciled?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
    party?: boolean | LedgerEntry$partyArgs<ExtArgs>
    transaction?: boolean | LedgerEntry$transactionArgs<ExtArgs>
  }, ExtArgs["result"]["ledgerEntry"]>

  export type LedgerEntrySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    partyId?: boolean
    transactionId?: boolean
    date?: boolean
    debit?: boolean
    credit?: boolean
    reference?: boolean
    isReconciled?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
    party?: boolean | LedgerEntry$partyArgs<ExtArgs>
    transaction?: boolean | LedgerEntry$transactionArgs<ExtArgs>
  }, ExtArgs["result"]["ledgerEntry"]>

  export type LedgerEntrySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    accountId?: boolean
    partyId?: boolean
    transactionId?: boolean
    date?: boolean
    debit?: boolean
    credit?: boolean
    reference?: boolean
    isReconciled?: boolean
    account?: boolean | AccountDefaultArgs<ExtArgs>
    party?: boolean | LedgerEntry$partyArgs<ExtArgs>
    transaction?: boolean | LedgerEntry$transactionArgs<ExtArgs>
  }, ExtArgs["result"]["ledgerEntry"]>

  export type LedgerEntrySelectScalar = {
    id?: boolean
    accountId?: boolean
    partyId?: boolean
    transactionId?: boolean
    date?: boolean
    debit?: boolean
    credit?: boolean
    reference?: boolean
    isReconciled?: boolean
  }

  export type LedgerEntryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "accountId" | "partyId" | "transactionId" | "date" | "debit" | "credit" | "reference" | "isReconciled", ExtArgs["result"]["ledgerEntry"]>
  export type LedgerEntryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
    party?: boolean | LedgerEntry$partyArgs<ExtArgs>
    transaction?: boolean | LedgerEntry$transactionArgs<ExtArgs>
  }
  export type LedgerEntryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
    party?: boolean | LedgerEntry$partyArgs<ExtArgs>
    transaction?: boolean | LedgerEntry$transactionArgs<ExtArgs>
  }
  export type LedgerEntryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    account?: boolean | AccountDefaultArgs<ExtArgs>
    party?: boolean | LedgerEntry$partyArgs<ExtArgs>
    transaction?: boolean | LedgerEntry$transactionArgs<ExtArgs>
  }

  export type $LedgerEntryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LedgerEntry"
    objects: {
      account: Prisma.$AccountPayload<ExtArgs>
      party: Prisma.$PartyPayload<ExtArgs> | null
      transaction: Prisma.$TransactionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      accountId: string
      partyId: string | null
      transactionId: string | null
      date: Date
      debit: number
      credit: number
      reference: string | null
      isReconciled: boolean
    }, ExtArgs["result"]["ledgerEntry"]>
    composites: {}
  }

  type LedgerEntryGetPayload<S extends boolean | null | undefined | LedgerEntryDefaultArgs> = $Result.GetResult<Prisma.$LedgerEntryPayload, S>

  type LedgerEntryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<LedgerEntryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: LedgerEntryCountAggregateInputType | true
    }

  export interface LedgerEntryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LedgerEntry'], meta: { name: 'LedgerEntry' } }
    /**
     * Find zero or one LedgerEntry that matches the filter.
     * @param {LedgerEntryFindUniqueArgs} args - Arguments to find a LedgerEntry
     * @example
     * // Get one LedgerEntry
     * const ledgerEntry = await prisma.ledgerEntry.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LedgerEntryFindUniqueArgs>(args: SelectSubset<T, LedgerEntryFindUniqueArgs<ExtArgs>>): Prisma__LedgerEntryClient<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one LedgerEntry that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {LedgerEntryFindUniqueOrThrowArgs} args - Arguments to find a LedgerEntry
     * @example
     * // Get one LedgerEntry
     * const ledgerEntry = await prisma.ledgerEntry.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LedgerEntryFindUniqueOrThrowArgs>(args: SelectSubset<T, LedgerEntryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LedgerEntryClient<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LedgerEntry that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerEntryFindFirstArgs} args - Arguments to find a LedgerEntry
     * @example
     * // Get one LedgerEntry
     * const ledgerEntry = await prisma.ledgerEntry.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LedgerEntryFindFirstArgs>(args?: SelectSubset<T, LedgerEntryFindFirstArgs<ExtArgs>>): Prisma__LedgerEntryClient<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first LedgerEntry that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerEntryFindFirstOrThrowArgs} args - Arguments to find a LedgerEntry
     * @example
     * // Get one LedgerEntry
     * const ledgerEntry = await prisma.ledgerEntry.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LedgerEntryFindFirstOrThrowArgs>(args?: SelectSubset<T, LedgerEntryFindFirstOrThrowArgs<ExtArgs>>): Prisma__LedgerEntryClient<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more LedgerEntries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerEntryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LedgerEntries
     * const ledgerEntries = await prisma.ledgerEntry.findMany()
     * 
     * // Get first 10 LedgerEntries
     * const ledgerEntries = await prisma.ledgerEntry.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ledgerEntryWithIdOnly = await prisma.ledgerEntry.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LedgerEntryFindManyArgs>(args?: SelectSubset<T, LedgerEntryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a LedgerEntry.
     * @param {LedgerEntryCreateArgs} args - Arguments to create a LedgerEntry.
     * @example
     * // Create one LedgerEntry
     * const LedgerEntry = await prisma.ledgerEntry.create({
     *   data: {
     *     // ... data to create a LedgerEntry
     *   }
     * })
     * 
     */
    create<T extends LedgerEntryCreateArgs>(args: SelectSubset<T, LedgerEntryCreateArgs<ExtArgs>>): Prisma__LedgerEntryClient<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many LedgerEntries.
     * @param {LedgerEntryCreateManyArgs} args - Arguments to create many LedgerEntries.
     * @example
     * // Create many LedgerEntries
     * const ledgerEntry = await prisma.ledgerEntry.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LedgerEntryCreateManyArgs>(args?: SelectSubset<T, LedgerEntryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LedgerEntries and returns the data saved in the database.
     * @param {LedgerEntryCreateManyAndReturnArgs} args - Arguments to create many LedgerEntries.
     * @example
     * // Create many LedgerEntries
     * const ledgerEntry = await prisma.ledgerEntry.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LedgerEntries and only return the `id`
     * const ledgerEntryWithIdOnly = await prisma.ledgerEntry.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LedgerEntryCreateManyAndReturnArgs>(args?: SelectSubset<T, LedgerEntryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a LedgerEntry.
     * @param {LedgerEntryDeleteArgs} args - Arguments to delete one LedgerEntry.
     * @example
     * // Delete one LedgerEntry
     * const LedgerEntry = await prisma.ledgerEntry.delete({
     *   where: {
     *     // ... filter to delete one LedgerEntry
     *   }
     * })
     * 
     */
    delete<T extends LedgerEntryDeleteArgs>(args: SelectSubset<T, LedgerEntryDeleteArgs<ExtArgs>>): Prisma__LedgerEntryClient<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one LedgerEntry.
     * @param {LedgerEntryUpdateArgs} args - Arguments to update one LedgerEntry.
     * @example
     * // Update one LedgerEntry
     * const ledgerEntry = await prisma.ledgerEntry.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LedgerEntryUpdateArgs>(args: SelectSubset<T, LedgerEntryUpdateArgs<ExtArgs>>): Prisma__LedgerEntryClient<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more LedgerEntries.
     * @param {LedgerEntryDeleteManyArgs} args - Arguments to filter LedgerEntries to delete.
     * @example
     * // Delete a few LedgerEntries
     * const { count } = await prisma.ledgerEntry.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LedgerEntryDeleteManyArgs>(args?: SelectSubset<T, LedgerEntryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LedgerEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerEntryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LedgerEntries
     * const ledgerEntry = await prisma.ledgerEntry.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LedgerEntryUpdateManyArgs>(args: SelectSubset<T, LedgerEntryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LedgerEntries and returns the data updated in the database.
     * @param {LedgerEntryUpdateManyAndReturnArgs} args - Arguments to update many LedgerEntries.
     * @example
     * // Update many LedgerEntries
     * const ledgerEntry = await prisma.ledgerEntry.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more LedgerEntries and only return the `id`
     * const ledgerEntryWithIdOnly = await prisma.ledgerEntry.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends LedgerEntryUpdateManyAndReturnArgs>(args: SelectSubset<T, LedgerEntryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one LedgerEntry.
     * @param {LedgerEntryUpsertArgs} args - Arguments to update or create a LedgerEntry.
     * @example
     * // Update or create a LedgerEntry
     * const ledgerEntry = await prisma.ledgerEntry.upsert({
     *   create: {
     *     // ... data to create a LedgerEntry
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LedgerEntry we want to update
     *   }
     * })
     */
    upsert<T extends LedgerEntryUpsertArgs>(args: SelectSubset<T, LedgerEntryUpsertArgs<ExtArgs>>): Prisma__LedgerEntryClient<$Result.GetResult<Prisma.$LedgerEntryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of LedgerEntries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerEntryCountArgs} args - Arguments to filter LedgerEntries to count.
     * @example
     * // Count the number of LedgerEntries
     * const count = await prisma.ledgerEntry.count({
     *   where: {
     *     // ... the filter for the LedgerEntries we want to count
     *   }
     * })
    **/
    count<T extends LedgerEntryCountArgs>(
      args?: Subset<T, LedgerEntryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LedgerEntryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LedgerEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerEntryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LedgerEntryAggregateArgs>(args: Subset<T, LedgerEntryAggregateArgs>): Prisma.PrismaPromise<GetLedgerEntryAggregateType<T>>

    /**
     * Group by LedgerEntry.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LedgerEntryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LedgerEntryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LedgerEntryGroupByArgs['orderBy'] }
        : { orderBy?: LedgerEntryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LedgerEntryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLedgerEntryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LedgerEntry model
   */
  readonly fields: LedgerEntryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LedgerEntry.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LedgerEntryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    account<T extends AccountDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AccountDefaultArgs<ExtArgs>>): Prisma__AccountClient<$Result.GetResult<Prisma.$AccountPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    party<T extends LedgerEntry$partyArgs<ExtArgs> = {}>(args?: Subset<T, LedgerEntry$partyArgs<ExtArgs>>): Prisma__PartyClient<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    transaction<T extends LedgerEntry$transactionArgs<ExtArgs> = {}>(args?: Subset<T, LedgerEntry$transactionArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LedgerEntry model
   */
  interface LedgerEntryFieldRefs {
    readonly id: FieldRef<"LedgerEntry", 'String'>
    readonly accountId: FieldRef<"LedgerEntry", 'String'>
    readonly partyId: FieldRef<"LedgerEntry", 'String'>
    readonly transactionId: FieldRef<"LedgerEntry", 'String'>
    readonly date: FieldRef<"LedgerEntry", 'DateTime'>
    readonly debit: FieldRef<"LedgerEntry", 'Float'>
    readonly credit: FieldRef<"LedgerEntry", 'Float'>
    readonly reference: FieldRef<"LedgerEntry", 'String'>
    readonly isReconciled: FieldRef<"LedgerEntry", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * LedgerEntry findUnique
   */
  export type LedgerEntryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    /**
     * Filter, which LedgerEntry to fetch.
     */
    where: LedgerEntryWhereUniqueInput
  }

  /**
   * LedgerEntry findUniqueOrThrow
   */
  export type LedgerEntryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    /**
     * Filter, which LedgerEntry to fetch.
     */
    where: LedgerEntryWhereUniqueInput
  }

  /**
   * LedgerEntry findFirst
   */
  export type LedgerEntryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    /**
     * Filter, which LedgerEntry to fetch.
     */
    where?: LedgerEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LedgerEntries to fetch.
     */
    orderBy?: LedgerEntryOrderByWithRelationInput | LedgerEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LedgerEntries.
     */
    cursor?: LedgerEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LedgerEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LedgerEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LedgerEntries.
     */
    distinct?: LedgerEntryScalarFieldEnum | LedgerEntryScalarFieldEnum[]
  }

  /**
   * LedgerEntry findFirstOrThrow
   */
  export type LedgerEntryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    /**
     * Filter, which LedgerEntry to fetch.
     */
    where?: LedgerEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LedgerEntries to fetch.
     */
    orderBy?: LedgerEntryOrderByWithRelationInput | LedgerEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LedgerEntries.
     */
    cursor?: LedgerEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LedgerEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LedgerEntries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LedgerEntries.
     */
    distinct?: LedgerEntryScalarFieldEnum | LedgerEntryScalarFieldEnum[]
  }

  /**
   * LedgerEntry findMany
   */
  export type LedgerEntryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    /**
     * Filter, which LedgerEntries to fetch.
     */
    where?: LedgerEntryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LedgerEntries to fetch.
     */
    orderBy?: LedgerEntryOrderByWithRelationInput | LedgerEntryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LedgerEntries.
     */
    cursor?: LedgerEntryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LedgerEntries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LedgerEntries.
     */
    skip?: number
    distinct?: LedgerEntryScalarFieldEnum | LedgerEntryScalarFieldEnum[]
  }

  /**
   * LedgerEntry create
   */
  export type LedgerEntryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    /**
     * The data needed to create a LedgerEntry.
     */
    data: XOR<LedgerEntryCreateInput, LedgerEntryUncheckedCreateInput>
  }

  /**
   * LedgerEntry createMany
   */
  export type LedgerEntryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LedgerEntries.
     */
    data: LedgerEntryCreateManyInput | LedgerEntryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LedgerEntry createManyAndReturn
   */
  export type LedgerEntryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * The data used to create many LedgerEntries.
     */
    data: LedgerEntryCreateManyInput | LedgerEntryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * LedgerEntry update
   */
  export type LedgerEntryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    /**
     * The data needed to update a LedgerEntry.
     */
    data: XOR<LedgerEntryUpdateInput, LedgerEntryUncheckedUpdateInput>
    /**
     * Choose, which LedgerEntry to update.
     */
    where: LedgerEntryWhereUniqueInput
  }

  /**
   * LedgerEntry updateMany
   */
  export type LedgerEntryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LedgerEntries.
     */
    data: XOR<LedgerEntryUpdateManyMutationInput, LedgerEntryUncheckedUpdateManyInput>
    /**
     * Filter which LedgerEntries to update
     */
    where?: LedgerEntryWhereInput
    /**
     * Limit how many LedgerEntries to update.
     */
    limit?: number
  }

  /**
   * LedgerEntry updateManyAndReturn
   */
  export type LedgerEntryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * The data used to update LedgerEntries.
     */
    data: XOR<LedgerEntryUpdateManyMutationInput, LedgerEntryUncheckedUpdateManyInput>
    /**
     * Filter which LedgerEntries to update
     */
    where?: LedgerEntryWhereInput
    /**
     * Limit how many LedgerEntries to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * LedgerEntry upsert
   */
  export type LedgerEntryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    /**
     * The filter to search for the LedgerEntry to update in case it exists.
     */
    where: LedgerEntryWhereUniqueInput
    /**
     * In case the LedgerEntry found by the `where` argument doesn't exist, create a new LedgerEntry with this data.
     */
    create: XOR<LedgerEntryCreateInput, LedgerEntryUncheckedCreateInput>
    /**
     * In case the LedgerEntry was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LedgerEntryUpdateInput, LedgerEntryUncheckedUpdateInput>
  }

  /**
   * LedgerEntry delete
   */
  export type LedgerEntryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
    /**
     * Filter which LedgerEntry to delete.
     */
    where: LedgerEntryWhereUniqueInput
  }

  /**
   * LedgerEntry deleteMany
   */
  export type LedgerEntryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LedgerEntries to delete
     */
    where?: LedgerEntryWhereInput
    /**
     * Limit how many LedgerEntries to delete.
     */
    limit?: number
  }

  /**
   * LedgerEntry.party
   */
  export type LedgerEntry$partyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Party
     */
    select?: PartySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Party
     */
    omit?: PartyOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PartyInclude<ExtArgs> | null
    where?: PartyWhereInput
  }

  /**
   * LedgerEntry.transaction
   */
  export type LedgerEntry$transactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
  }

  /**
   * LedgerEntry without action
   */
  export type LedgerEntryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LedgerEntry
     */
    select?: LedgerEntrySelect<ExtArgs> | null
    /**
     * Omit specific fields from the LedgerEntry
     */
    omit?: LedgerEntryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LedgerEntryInclude<ExtArgs> | null
  }


  /**
   * Model VendorProduct
   */

  export type AggregateVendorProduct = {
    _count: VendorProductCountAggregateOutputType | null
    _avg: VendorProductAvgAggregateOutputType | null
    _sum: VendorProductSumAggregateOutputType | null
    _min: VendorProductMinAggregateOutputType | null
    _max: VendorProductMaxAggregateOutputType | null
  }

  export type VendorProductAvgAggregateOutputType = {
    lastPrice: number | null
    leadTime: number | null
  }

  export type VendorProductSumAggregateOutputType = {
    lastPrice: number | null
    leadTime: number | null
  }

  export type VendorProductMinAggregateOutputType = {
    id: string | null
    vendorId: string | null
    variantId: string | null
    lastPrice: number | null
    leadTime: number | null
  }

  export type VendorProductMaxAggregateOutputType = {
    id: string | null
    vendorId: string | null
    variantId: string | null
    lastPrice: number | null
    leadTime: number | null
  }

  export type VendorProductCountAggregateOutputType = {
    id: number
    vendorId: number
    variantId: number
    lastPrice: number
    leadTime: number
    _all: number
  }


  export type VendorProductAvgAggregateInputType = {
    lastPrice?: true
    leadTime?: true
  }

  export type VendorProductSumAggregateInputType = {
    lastPrice?: true
    leadTime?: true
  }

  export type VendorProductMinAggregateInputType = {
    id?: true
    vendorId?: true
    variantId?: true
    lastPrice?: true
    leadTime?: true
  }

  export type VendorProductMaxAggregateInputType = {
    id?: true
    vendorId?: true
    variantId?: true
    lastPrice?: true
    leadTime?: true
  }

  export type VendorProductCountAggregateInputType = {
    id?: true
    vendorId?: true
    variantId?: true
    lastPrice?: true
    leadTime?: true
    _all?: true
  }

  export type VendorProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VendorProduct to aggregate.
     */
    where?: VendorProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VendorProducts to fetch.
     */
    orderBy?: VendorProductOrderByWithRelationInput | VendorProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VendorProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VendorProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VendorProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VendorProducts
    **/
    _count?: true | VendorProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VendorProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VendorProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VendorProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VendorProductMaxAggregateInputType
  }

  export type GetVendorProductAggregateType<T extends VendorProductAggregateArgs> = {
        [P in keyof T & keyof AggregateVendorProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVendorProduct[P]>
      : GetScalarType<T[P], AggregateVendorProduct[P]>
  }




  export type VendorProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VendorProductWhereInput
    orderBy?: VendorProductOrderByWithAggregationInput | VendorProductOrderByWithAggregationInput[]
    by: VendorProductScalarFieldEnum[] | VendorProductScalarFieldEnum
    having?: VendorProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VendorProductCountAggregateInputType | true
    _avg?: VendorProductAvgAggregateInputType
    _sum?: VendorProductSumAggregateInputType
    _min?: VendorProductMinAggregateInputType
    _max?: VendorProductMaxAggregateInputType
  }

  export type VendorProductGroupByOutputType = {
    id: string
    vendorId: string
    variantId: string
    lastPrice: number | null
    leadTime: number | null
    _count: VendorProductCountAggregateOutputType | null
    _avg: VendorProductAvgAggregateOutputType | null
    _sum: VendorProductSumAggregateOutputType | null
    _min: VendorProductMinAggregateOutputType | null
    _max: VendorProductMaxAggregateOutputType | null
  }

  type GetVendorProductGroupByPayload<T extends VendorProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VendorProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VendorProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VendorProductGroupByOutputType[P]>
            : GetScalarType<T[P], VendorProductGroupByOutputType[P]>
        }
      >
    >


  export type VendorProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vendorId?: boolean
    variantId?: boolean
    lastPrice?: boolean
    leadTime?: boolean
    vendor?: boolean | PartyDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vendorProduct"]>

  export type VendorProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vendorId?: boolean
    variantId?: boolean
    lastPrice?: boolean
    leadTime?: boolean
    vendor?: boolean | PartyDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vendorProduct"]>

  export type VendorProductSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    vendorId?: boolean
    variantId?: boolean
    lastPrice?: boolean
    leadTime?: boolean
    vendor?: boolean | PartyDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["vendorProduct"]>

  export type VendorProductSelectScalar = {
    id?: boolean
    vendorId?: boolean
    variantId?: boolean
    lastPrice?: boolean
    leadTime?: boolean
  }

  export type VendorProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "vendorId" | "variantId" | "lastPrice" | "leadTime", ExtArgs["result"]["vendorProduct"]>
  export type VendorProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vendor?: boolean | PartyDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }
  export type VendorProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vendor?: boolean | PartyDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }
  export type VendorProductIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    vendor?: boolean | PartyDefaultArgs<ExtArgs>
    variant?: boolean | VariantDefaultArgs<ExtArgs>
  }

  export type $VendorProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VendorProduct"
    objects: {
      vendor: Prisma.$PartyPayload<ExtArgs>
      variant: Prisma.$VariantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      vendorId: string
      variantId: string
      lastPrice: number | null
      leadTime: number | null
    }, ExtArgs["result"]["vendorProduct"]>
    composites: {}
  }

  type VendorProductGetPayload<S extends boolean | null | undefined | VendorProductDefaultArgs> = $Result.GetResult<Prisma.$VendorProductPayload, S>

  type VendorProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VendorProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VendorProductCountAggregateInputType | true
    }

  export interface VendorProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VendorProduct'], meta: { name: 'VendorProduct' } }
    /**
     * Find zero or one VendorProduct that matches the filter.
     * @param {VendorProductFindUniqueArgs} args - Arguments to find a VendorProduct
     * @example
     * // Get one VendorProduct
     * const vendorProduct = await prisma.vendorProduct.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VendorProductFindUniqueArgs>(args: SelectSubset<T, VendorProductFindUniqueArgs<ExtArgs>>): Prisma__VendorProductClient<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VendorProduct that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VendorProductFindUniqueOrThrowArgs} args - Arguments to find a VendorProduct
     * @example
     * // Get one VendorProduct
     * const vendorProduct = await prisma.vendorProduct.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VendorProductFindUniqueOrThrowArgs>(args: SelectSubset<T, VendorProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VendorProductClient<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VendorProduct that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorProductFindFirstArgs} args - Arguments to find a VendorProduct
     * @example
     * // Get one VendorProduct
     * const vendorProduct = await prisma.vendorProduct.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VendorProductFindFirstArgs>(args?: SelectSubset<T, VendorProductFindFirstArgs<ExtArgs>>): Prisma__VendorProductClient<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VendorProduct that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorProductFindFirstOrThrowArgs} args - Arguments to find a VendorProduct
     * @example
     * // Get one VendorProduct
     * const vendorProduct = await prisma.vendorProduct.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VendorProductFindFirstOrThrowArgs>(args?: SelectSubset<T, VendorProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__VendorProductClient<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VendorProducts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VendorProducts
     * const vendorProducts = await prisma.vendorProduct.findMany()
     * 
     * // Get first 10 VendorProducts
     * const vendorProducts = await prisma.vendorProduct.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const vendorProductWithIdOnly = await prisma.vendorProduct.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VendorProductFindManyArgs>(args?: SelectSubset<T, VendorProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VendorProduct.
     * @param {VendorProductCreateArgs} args - Arguments to create a VendorProduct.
     * @example
     * // Create one VendorProduct
     * const VendorProduct = await prisma.vendorProduct.create({
     *   data: {
     *     // ... data to create a VendorProduct
     *   }
     * })
     * 
     */
    create<T extends VendorProductCreateArgs>(args: SelectSubset<T, VendorProductCreateArgs<ExtArgs>>): Prisma__VendorProductClient<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VendorProducts.
     * @param {VendorProductCreateManyArgs} args - Arguments to create many VendorProducts.
     * @example
     * // Create many VendorProducts
     * const vendorProduct = await prisma.vendorProduct.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VendorProductCreateManyArgs>(args?: SelectSubset<T, VendorProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VendorProducts and returns the data saved in the database.
     * @param {VendorProductCreateManyAndReturnArgs} args - Arguments to create many VendorProducts.
     * @example
     * // Create many VendorProducts
     * const vendorProduct = await prisma.vendorProduct.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VendorProducts and only return the `id`
     * const vendorProductWithIdOnly = await prisma.vendorProduct.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VendorProductCreateManyAndReturnArgs>(args?: SelectSubset<T, VendorProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VendorProduct.
     * @param {VendorProductDeleteArgs} args - Arguments to delete one VendorProduct.
     * @example
     * // Delete one VendorProduct
     * const VendorProduct = await prisma.vendorProduct.delete({
     *   where: {
     *     // ... filter to delete one VendorProduct
     *   }
     * })
     * 
     */
    delete<T extends VendorProductDeleteArgs>(args: SelectSubset<T, VendorProductDeleteArgs<ExtArgs>>): Prisma__VendorProductClient<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VendorProduct.
     * @param {VendorProductUpdateArgs} args - Arguments to update one VendorProduct.
     * @example
     * // Update one VendorProduct
     * const vendorProduct = await prisma.vendorProduct.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VendorProductUpdateArgs>(args: SelectSubset<T, VendorProductUpdateArgs<ExtArgs>>): Prisma__VendorProductClient<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VendorProducts.
     * @param {VendorProductDeleteManyArgs} args - Arguments to filter VendorProducts to delete.
     * @example
     * // Delete a few VendorProducts
     * const { count } = await prisma.vendorProduct.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VendorProductDeleteManyArgs>(args?: SelectSubset<T, VendorProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VendorProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VendorProducts
     * const vendorProduct = await prisma.vendorProduct.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VendorProductUpdateManyArgs>(args: SelectSubset<T, VendorProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VendorProducts and returns the data updated in the database.
     * @param {VendorProductUpdateManyAndReturnArgs} args - Arguments to update many VendorProducts.
     * @example
     * // Update many VendorProducts
     * const vendorProduct = await prisma.vendorProduct.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VendorProducts and only return the `id`
     * const vendorProductWithIdOnly = await prisma.vendorProduct.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VendorProductUpdateManyAndReturnArgs>(args: SelectSubset<T, VendorProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VendorProduct.
     * @param {VendorProductUpsertArgs} args - Arguments to update or create a VendorProduct.
     * @example
     * // Update or create a VendorProduct
     * const vendorProduct = await prisma.vendorProduct.upsert({
     *   create: {
     *     // ... data to create a VendorProduct
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VendorProduct we want to update
     *   }
     * })
     */
    upsert<T extends VendorProductUpsertArgs>(args: SelectSubset<T, VendorProductUpsertArgs<ExtArgs>>): Prisma__VendorProductClient<$Result.GetResult<Prisma.$VendorProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VendorProducts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorProductCountArgs} args - Arguments to filter VendorProducts to count.
     * @example
     * // Count the number of VendorProducts
     * const count = await prisma.vendorProduct.count({
     *   where: {
     *     // ... the filter for the VendorProducts we want to count
     *   }
     * })
    **/
    count<T extends VendorProductCountArgs>(
      args?: Subset<T, VendorProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VendorProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VendorProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VendorProductAggregateArgs>(args: Subset<T, VendorProductAggregateArgs>): Prisma.PrismaPromise<GetVendorProductAggregateType<T>>

    /**
     * Group by VendorProduct.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VendorProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VendorProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VendorProductGroupByArgs['orderBy'] }
        : { orderBy?: VendorProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VendorProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVendorProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VendorProduct model
   */
  readonly fields: VendorProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VendorProduct.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VendorProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    vendor<T extends PartyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PartyDefaultArgs<ExtArgs>>): Prisma__PartyClient<$Result.GetResult<Prisma.$PartyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    variant<T extends VariantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VariantDefaultArgs<ExtArgs>>): Prisma__VariantClient<$Result.GetResult<Prisma.$VariantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VendorProduct model
   */
  interface VendorProductFieldRefs {
    readonly id: FieldRef<"VendorProduct", 'String'>
    readonly vendorId: FieldRef<"VendorProduct", 'String'>
    readonly variantId: FieldRef<"VendorProduct", 'String'>
    readonly lastPrice: FieldRef<"VendorProduct", 'Float'>
    readonly leadTime: FieldRef<"VendorProduct", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * VendorProduct findUnique
   */
  export type VendorProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
    /**
     * Filter, which VendorProduct to fetch.
     */
    where: VendorProductWhereUniqueInput
  }

  /**
   * VendorProduct findUniqueOrThrow
   */
  export type VendorProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
    /**
     * Filter, which VendorProduct to fetch.
     */
    where: VendorProductWhereUniqueInput
  }

  /**
   * VendorProduct findFirst
   */
  export type VendorProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
    /**
     * Filter, which VendorProduct to fetch.
     */
    where?: VendorProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VendorProducts to fetch.
     */
    orderBy?: VendorProductOrderByWithRelationInput | VendorProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VendorProducts.
     */
    cursor?: VendorProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VendorProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VendorProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VendorProducts.
     */
    distinct?: VendorProductScalarFieldEnum | VendorProductScalarFieldEnum[]
  }

  /**
   * VendorProduct findFirstOrThrow
   */
  export type VendorProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
    /**
     * Filter, which VendorProduct to fetch.
     */
    where?: VendorProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VendorProducts to fetch.
     */
    orderBy?: VendorProductOrderByWithRelationInput | VendorProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VendorProducts.
     */
    cursor?: VendorProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VendorProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VendorProducts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VendorProducts.
     */
    distinct?: VendorProductScalarFieldEnum | VendorProductScalarFieldEnum[]
  }

  /**
   * VendorProduct findMany
   */
  export type VendorProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
    /**
     * Filter, which VendorProducts to fetch.
     */
    where?: VendorProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VendorProducts to fetch.
     */
    orderBy?: VendorProductOrderByWithRelationInput | VendorProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VendorProducts.
     */
    cursor?: VendorProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VendorProducts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VendorProducts.
     */
    skip?: number
    distinct?: VendorProductScalarFieldEnum | VendorProductScalarFieldEnum[]
  }

  /**
   * VendorProduct create
   */
  export type VendorProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
    /**
     * The data needed to create a VendorProduct.
     */
    data: XOR<VendorProductCreateInput, VendorProductUncheckedCreateInput>
  }

  /**
   * VendorProduct createMany
   */
  export type VendorProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VendorProducts.
     */
    data: VendorProductCreateManyInput | VendorProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VendorProduct createManyAndReturn
   */
  export type VendorProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * The data used to create many VendorProducts.
     */
    data: VendorProductCreateManyInput | VendorProductCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * VendorProduct update
   */
  export type VendorProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
    /**
     * The data needed to update a VendorProduct.
     */
    data: XOR<VendorProductUpdateInput, VendorProductUncheckedUpdateInput>
    /**
     * Choose, which VendorProduct to update.
     */
    where: VendorProductWhereUniqueInput
  }

  /**
   * VendorProduct updateMany
   */
  export type VendorProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VendorProducts.
     */
    data: XOR<VendorProductUpdateManyMutationInput, VendorProductUncheckedUpdateManyInput>
    /**
     * Filter which VendorProducts to update
     */
    where?: VendorProductWhereInput
    /**
     * Limit how many VendorProducts to update.
     */
    limit?: number
  }

  /**
   * VendorProduct updateManyAndReturn
   */
  export type VendorProductUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * The data used to update VendorProducts.
     */
    data: XOR<VendorProductUpdateManyMutationInput, VendorProductUncheckedUpdateManyInput>
    /**
     * Filter which VendorProducts to update
     */
    where?: VendorProductWhereInput
    /**
     * Limit how many VendorProducts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * VendorProduct upsert
   */
  export type VendorProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
    /**
     * The filter to search for the VendorProduct to update in case it exists.
     */
    where: VendorProductWhereUniqueInput
    /**
     * In case the VendorProduct found by the `where` argument doesn't exist, create a new VendorProduct with this data.
     */
    create: XOR<VendorProductCreateInput, VendorProductUncheckedCreateInput>
    /**
     * In case the VendorProduct was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VendorProductUpdateInput, VendorProductUncheckedUpdateInput>
  }

  /**
   * VendorProduct delete
   */
  export type VendorProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
    /**
     * Filter which VendorProduct to delete.
     */
    where: VendorProductWhereUniqueInput
  }

  /**
   * VendorProduct deleteMany
   */
  export type VendorProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VendorProducts to delete
     */
    where?: VendorProductWhereInput
    /**
     * Limit how many VendorProducts to delete.
     */
    limit?: number
  }

  /**
   * VendorProduct without action
   */
  export type VendorProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VendorProduct
     */
    select?: VendorProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VendorProduct
     */
    omit?: VendorProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VendorProductInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    role: 'role',
    password: 'password',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const AuditLogScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    action: 'action',
    entity: 'entity',
    entityId: 'entityId',
    oldValues: 'oldValues',
    newValues: 'newValues',
    createdAt: 'createdAt'
  };

  export type AuditLogScalarFieldEnum = (typeof AuditLogScalarFieldEnum)[keyof typeof AuditLogScalarFieldEnum]


  export const WarehouseScalarFieldEnum: {
    id: 'id',
    name: 'name',
    address: 'address'
  };

  export type WarehouseScalarFieldEnum = (typeof WarehouseScalarFieldEnum)[keyof typeof WarehouseScalarFieldEnum]


  export const OutletScalarFieldEnum: {
    id: 'id',
    name: 'name',
    invoicePrefix: 'invoicePrefix',
    gstin: 'gstin',
    bankDetails: 'bankDetails',
    negativeStockPolicy: 'negativeStockPolicy'
  };

  export type OutletScalarFieldEnum = (typeof OutletScalarFieldEnum)[keyof typeof OutletScalarFieldEnum]


  export const CategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    parentId: 'parentId'
  };

  export type CategoryScalarFieldEnum = (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    id: 'id',
    name: 'name',
    brand: 'brand',
    hsnCode: 'hsnCode',
    gstRate: 'gstRate',
    baseUnit: 'baseUnit',
    purchaseUnit: 'purchaseUnit',
    salesUnit: 'salesUnit',
    conversionRatio: 'conversionRatio',
    categoryId: 'categoryId',
    isArchived: 'isArchived'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const VariantScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    sku: 'sku',
    specifications: 'specifications',
    purchasePrice: 'purchasePrice',
    sellingPrice: 'sellingPrice',
    pricingMethod: 'pricingMethod',
    markupPercent: 'markupPercent',
    minStockLevel: 'minStockLevel'
  };

  export type VariantScalarFieldEnum = (typeof VariantScalarFieldEnum)[keyof typeof VariantScalarFieldEnum]


  export const StockScalarFieldEnum: {
    id: 'id',
    variantId: 'variantId',
    warehouseId: 'warehouseId',
    outletId: 'outletId',
    quantity: 'quantity',
    inTransitQty: 'inTransitQty'
  };

  export type StockScalarFieldEnum = (typeof StockScalarFieldEnum)[keyof typeof StockScalarFieldEnum]


  export const PartyScalarFieldEnum: {
    id: 'id',
    type: 'type',
    name: 'name',
    gstin: 'gstin',
    pan: 'pan',
    address: 'address',
    state: 'state',
    contactInfo: 'contactInfo',
    creditPeriod: 'creditPeriod',
    creditLimit: 'creditLimit',
    openingBalance: 'openingBalance'
  };

  export type PartyScalarFieldEnum = (typeof PartyScalarFieldEnum)[keyof typeof PartyScalarFieldEnum]


  export const TransactionScalarFieldEnum: {
    id: 'id',
    type: 'type',
    txnNumber: 'txnNumber',
    date: 'date',
    partyId: 'partyId',
    fromLocationId: 'fromLocationId',
    toLocationId: 'toLocationId',
    totalTaxable: 'totalTaxable',
    totalTax: 'totalTax',
    freightCost: 'freightCost',
    grandTotal: 'grandTotal',
    status: 'status',
    parentId: 'parentId'
  };

  export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum]


  export const TransactionItemScalarFieldEnum: {
    id: 'id',
    transactionId: 'transactionId',
    variantId: 'variantId',
    quantity: 'quantity',
    rate: 'rate',
    freightFraction: 'freightFraction',
    taxableValue: 'taxableValue',
    cgst: 'cgst',
    sgst: 'sgst',
    igst: 'igst'
  };

  export type TransactionItemScalarFieldEnum = (typeof TransactionItemScalarFieldEnum)[keyof typeof TransactionItemScalarFieldEnum]


  export const AccountScalarFieldEnum: {
    id: 'id',
    code: 'code',
    name: 'name',
    group: 'group',
    isSystem: 'isSystem'
  };

  export type AccountScalarFieldEnum = (typeof AccountScalarFieldEnum)[keyof typeof AccountScalarFieldEnum]


  export const LedgerEntryScalarFieldEnum: {
    id: 'id',
    accountId: 'accountId',
    partyId: 'partyId',
    transactionId: 'transactionId',
    date: 'date',
    debit: 'debit',
    credit: 'credit',
    reference: 'reference',
    isReconciled: 'isReconciled'
  };

  export type LedgerEntryScalarFieldEnum = (typeof LedgerEntryScalarFieldEnum)[keyof typeof LedgerEntryScalarFieldEnum]


  export const VendorProductScalarFieldEnum: {
    id: 'id',
    vendorId: 'vendorId',
    variantId: 'variantId',
    lastPrice: 'lastPrice',
    leadTime: 'leadTime'
  };

  export type VendorProductScalarFieldEnum = (typeof VendorProductScalarFieldEnum)[keyof typeof VendorProductScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'PartyType'
   */
  export type EnumPartyTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PartyType'>
    


  /**
   * Reference to a field of type 'PartyType[]'
   */
  export type ListEnumPartyTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PartyType[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'TxType'
   */
  export type EnumTxTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TxType'>
    


  /**
   * Reference to a field of type 'TxType[]'
   */
  export type ListEnumTxTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TxType[]'>
    


  /**
   * Reference to a field of type 'AccountGroup'
   */
  export type EnumAccountGroupFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AccountGroup'>
    


  /**
   * Reference to a field of type 'AccountGroup[]'
   */
  export type ListEnumAccountGroupFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AccountGroup[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    password?: StringFilter<"User"> | string
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    outlets?: OutletListRelationFilter
    actions?: AuditLogListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    outlets?: OutletOrderByRelationAggregateInput
    actions?: AuditLogOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    password?: StringFilter<"User"> | string
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    outlets?: OutletListRelationFilter
    actions?: AuditLogListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    password?: StringWithAggregatesFilter<"User"> | string
    isActive?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type AuditLogWhereInput = {
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    userId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    entity?: StringFilter<"AuditLog"> | string
    entityId?: StringFilter<"AuditLog"> | string
    oldValues?: JsonNullableFilter<"AuditLog">
    newValues?: JsonNullableFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type AuditLogOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrder
    oldValues?: SortOrderInput | SortOrder
    newValues?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AuditLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuditLogWhereInput | AuditLogWhereInput[]
    OR?: AuditLogWhereInput[]
    NOT?: AuditLogWhereInput | AuditLogWhereInput[]
    userId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    entity?: StringFilter<"AuditLog"> | string
    entityId?: StringFilter<"AuditLog"> | string
    oldValues?: JsonNullableFilter<"AuditLog">
    newValues?: JsonNullableFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type AuditLogOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrder
    oldValues?: SortOrderInput | SortOrder
    newValues?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AuditLogCountOrderByAggregateInput
    _max?: AuditLogMaxOrderByAggregateInput
    _min?: AuditLogMinOrderByAggregateInput
  }

  export type AuditLogScalarWhereWithAggregatesInput = {
    AND?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    OR?: AuditLogScalarWhereWithAggregatesInput[]
    NOT?: AuditLogScalarWhereWithAggregatesInput | AuditLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AuditLog"> | string
    userId?: StringWithAggregatesFilter<"AuditLog"> | string
    action?: StringWithAggregatesFilter<"AuditLog"> | string
    entity?: StringWithAggregatesFilter<"AuditLog"> | string
    entityId?: StringWithAggregatesFilter<"AuditLog"> | string
    oldValues?: JsonNullableWithAggregatesFilter<"AuditLog">
    newValues?: JsonNullableWithAggregatesFilter<"AuditLog">
    createdAt?: DateTimeWithAggregatesFilter<"AuditLog"> | Date | string
  }

  export type WarehouseWhereInput = {
    AND?: WarehouseWhereInput | WarehouseWhereInput[]
    OR?: WarehouseWhereInput[]
    NOT?: WarehouseWhereInput | WarehouseWhereInput[]
    id?: StringFilter<"Warehouse"> | string
    name?: StringFilter<"Warehouse"> | string
    address?: StringNullableFilter<"Warehouse"> | string | null
    outlets?: OutletListRelationFilter
    stocks?: StockListRelationFilter
  }

  export type WarehouseOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrderInput | SortOrder
    outlets?: OutletOrderByRelationAggregateInput
    stocks?: StockOrderByRelationAggregateInput
  }

  export type WarehouseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WarehouseWhereInput | WarehouseWhereInput[]
    OR?: WarehouseWhereInput[]
    NOT?: WarehouseWhereInput | WarehouseWhereInput[]
    name?: StringFilter<"Warehouse"> | string
    address?: StringNullableFilter<"Warehouse"> | string | null
    outlets?: OutletListRelationFilter
    stocks?: StockListRelationFilter
  }, "id">

  export type WarehouseOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrderInput | SortOrder
    _count?: WarehouseCountOrderByAggregateInput
    _max?: WarehouseMaxOrderByAggregateInput
    _min?: WarehouseMinOrderByAggregateInput
  }

  export type WarehouseScalarWhereWithAggregatesInput = {
    AND?: WarehouseScalarWhereWithAggregatesInput | WarehouseScalarWhereWithAggregatesInput[]
    OR?: WarehouseScalarWhereWithAggregatesInput[]
    NOT?: WarehouseScalarWhereWithAggregatesInput | WarehouseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Warehouse"> | string
    name?: StringWithAggregatesFilter<"Warehouse"> | string
    address?: StringNullableWithAggregatesFilter<"Warehouse"> | string | null
  }

  export type OutletWhereInput = {
    AND?: OutletWhereInput | OutletWhereInput[]
    OR?: OutletWhereInput[]
    NOT?: OutletWhereInput | OutletWhereInput[]
    id?: StringFilter<"Outlet"> | string
    name?: StringFilter<"Outlet"> | string
    invoicePrefix?: StringFilter<"Outlet"> | string
    gstin?: StringNullableFilter<"Outlet"> | string | null
    bankDetails?: StringNullableFilter<"Outlet"> | string | null
    negativeStockPolicy?: StringFilter<"Outlet"> | string
    warehouses?: WarehouseListRelationFilter
    users?: UserListRelationFilter
    stocks?: StockListRelationFilter
  }

  export type OutletOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    invoicePrefix?: SortOrder
    gstin?: SortOrderInput | SortOrder
    bankDetails?: SortOrderInput | SortOrder
    negativeStockPolicy?: SortOrder
    warehouses?: WarehouseOrderByRelationAggregateInput
    users?: UserOrderByRelationAggregateInput
    stocks?: StockOrderByRelationAggregateInput
  }

  export type OutletWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OutletWhereInput | OutletWhereInput[]
    OR?: OutletWhereInput[]
    NOT?: OutletWhereInput | OutletWhereInput[]
    name?: StringFilter<"Outlet"> | string
    invoicePrefix?: StringFilter<"Outlet"> | string
    gstin?: StringNullableFilter<"Outlet"> | string | null
    bankDetails?: StringNullableFilter<"Outlet"> | string | null
    negativeStockPolicy?: StringFilter<"Outlet"> | string
    warehouses?: WarehouseListRelationFilter
    users?: UserListRelationFilter
    stocks?: StockListRelationFilter
  }, "id">

  export type OutletOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    invoicePrefix?: SortOrder
    gstin?: SortOrderInput | SortOrder
    bankDetails?: SortOrderInput | SortOrder
    negativeStockPolicy?: SortOrder
    _count?: OutletCountOrderByAggregateInput
    _max?: OutletMaxOrderByAggregateInput
    _min?: OutletMinOrderByAggregateInput
  }

  export type OutletScalarWhereWithAggregatesInput = {
    AND?: OutletScalarWhereWithAggregatesInput | OutletScalarWhereWithAggregatesInput[]
    OR?: OutletScalarWhereWithAggregatesInput[]
    NOT?: OutletScalarWhereWithAggregatesInput | OutletScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Outlet"> | string
    name?: StringWithAggregatesFilter<"Outlet"> | string
    invoicePrefix?: StringWithAggregatesFilter<"Outlet"> | string
    gstin?: StringNullableWithAggregatesFilter<"Outlet"> | string | null
    bankDetails?: StringNullableWithAggregatesFilter<"Outlet"> | string | null
    negativeStockPolicy?: StringWithAggregatesFilter<"Outlet"> | string
  }

  export type CategoryWhereInput = {
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    id?: StringFilter<"Category"> | string
    name?: StringFilter<"Category"> | string
    parentId?: StringNullableFilter<"Category"> | string | null
    parent?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    children?: CategoryListRelationFilter
    products?: ProductListRelationFilter
  }

  export type CategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    parentId?: SortOrderInput | SortOrder
    parent?: CategoryOrderByWithRelationInput
    children?: CategoryOrderByRelationAggregateInput
    products?: ProductOrderByRelationAggregateInput
  }

  export type CategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    name?: StringFilter<"Category"> | string
    parentId?: StringNullableFilter<"Category"> | string | null
    parent?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    children?: CategoryListRelationFilter
    products?: ProductListRelationFilter
  }, "id">

  export type CategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    parentId?: SortOrderInput | SortOrder
    _count?: CategoryCountOrderByAggregateInput
    _max?: CategoryMaxOrderByAggregateInput
    _min?: CategoryMinOrderByAggregateInput
  }

  export type CategoryScalarWhereWithAggregatesInput = {
    AND?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    OR?: CategoryScalarWhereWithAggregatesInput[]
    NOT?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Category"> | string
    name?: StringWithAggregatesFilter<"Category"> | string
    parentId?: StringNullableWithAggregatesFilter<"Category"> | string | null
  }

  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    brand?: StringNullableFilter<"Product"> | string | null
    hsnCode?: StringFilter<"Product"> | string
    gstRate?: FloatFilter<"Product"> | number
    baseUnit?: StringFilter<"Product"> | string
    purchaseUnit?: StringNullableFilter<"Product"> | string | null
    salesUnit?: StringNullableFilter<"Product"> | string | null
    conversionRatio?: FloatNullableFilter<"Product"> | number | null
    categoryId?: StringFilter<"Product"> | string
    isArchived?: BoolFilter<"Product"> | boolean
    category?: XOR<CategoryScalarRelationFilter, CategoryWhereInput>
    variants?: VariantListRelationFilter
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    brand?: SortOrderInput | SortOrder
    hsnCode?: SortOrder
    gstRate?: SortOrder
    baseUnit?: SortOrder
    purchaseUnit?: SortOrderInput | SortOrder
    salesUnit?: SortOrderInput | SortOrder
    conversionRatio?: SortOrderInput | SortOrder
    categoryId?: SortOrder
    isArchived?: SortOrder
    category?: CategoryOrderByWithRelationInput
    variants?: VariantOrderByRelationAggregateInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    name?: StringFilter<"Product"> | string
    brand?: StringNullableFilter<"Product"> | string | null
    hsnCode?: StringFilter<"Product"> | string
    gstRate?: FloatFilter<"Product"> | number
    baseUnit?: StringFilter<"Product"> | string
    purchaseUnit?: StringNullableFilter<"Product"> | string | null
    salesUnit?: StringNullableFilter<"Product"> | string | null
    conversionRatio?: FloatNullableFilter<"Product"> | number | null
    categoryId?: StringFilter<"Product"> | string
    isArchived?: BoolFilter<"Product"> | boolean
    category?: XOR<CategoryScalarRelationFilter, CategoryWhereInput>
    variants?: VariantListRelationFilter
  }, "id">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    brand?: SortOrderInput | SortOrder
    hsnCode?: SortOrder
    gstRate?: SortOrder
    baseUnit?: SortOrder
    purchaseUnit?: SortOrderInput | SortOrder
    salesUnit?: SortOrderInput | SortOrder
    conversionRatio?: SortOrderInput | SortOrder
    categoryId?: SortOrder
    isArchived?: SortOrder
    _count?: ProductCountOrderByAggregateInput
    _avg?: ProductAvgOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
    _sum?: ProductSumOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Product"> | string
    name?: StringWithAggregatesFilter<"Product"> | string
    brand?: StringNullableWithAggregatesFilter<"Product"> | string | null
    hsnCode?: StringWithAggregatesFilter<"Product"> | string
    gstRate?: FloatWithAggregatesFilter<"Product"> | number
    baseUnit?: StringWithAggregatesFilter<"Product"> | string
    purchaseUnit?: StringNullableWithAggregatesFilter<"Product"> | string | null
    salesUnit?: StringNullableWithAggregatesFilter<"Product"> | string | null
    conversionRatio?: FloatNullableWithAggregatesFilter<"Product"> | number | null
    categoryId?: StringWithAggregatesFilter<"Product"> | string
    isArchived?: BoolWithAggregatesFilter<"Product"> | boolean
  }

  export type VariantWhereInput = {
    AND?: VariantWhereInput | VariantWhereInput[]
    OR?: VariantWhereInput[]
    NOT?: VariantWhereInput | VariantWhereInput[]
    id?: StringFilter<"Variant"> | string
    productId?: StringFilter<"Variant"> | string
    sku?: StringFilter<"Variant"> | string
    specifications?: JsonNullableFilter<"Variant">
    purchasePrice?: FloatFilter<"Variant"> | number
    sellingPrice?: FloatFilter<"Variant"> | number
    pricingMethod?: StringFilter<"Variant"> | string
    markupPercent?: FloatNullableFilter<"Variant"> | number | null
    minStockLevel?: FloatFilter<"Variant"> | number
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
    stocks?: StockListRelationFilter
    txnItems?: TransactionItemListRelationFilter
    suppliers?: VendorProductListRelationFilter
  }

  export type VariantOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    sku?: SortOrder
    specifications?: SortOrderInput | SortOrder
    purchasePrice?: SortOrder
    sellingPrice?: SortOrder
    pricingMethod?: SortOrder
    markupPercent?: SortOrderInput | SortOrder
    minStockLevel?: SortOrder
    product?: ProductOrderByWithRelationInput
    stocks?: StockOrderByRelationAggregateInput
    txnItems?: TransactionItemOrderByRelationAggregateInput
    suppliers?: VendorProductOrderByRelationAggregateInput
  }

  export type VariantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    sku?: string
    AND?: VariantWhereInput | VariantWhereInput[]
    OR?: VariantWhereInput[]
    NOT?: VariantWhereInput | VariantWhereInput[]
    productId?: StringFilter<"Variant"> | string
    specifications?: JsonNullableFilter<"Variant">
    purchasePrice?: FloatFilter<"Variant"> | number
    sellingPrice?: FloatFilter<"Variant"> | number
    pricingMethod?: StringFilter<"Variant"> | string
    markupPercent?: FloatNullableFilter<"Variant"> | number | null
    minStockLevel?: FloatFilter<"Variant"> | number
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
    stocks?: StockListRelationFilter
    txnItems?: TransactionItemListRelationFilter
    suppliers?: VendorProductListRelationFilter
  }, "id" | "sku">

  export type VariantOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    sku?: SortOrder
    specifications?: SortOrderInput | SortOrder
    purchasePrice?: SortOrder
    sellingPrice?: SortOrder
    pricingMethod?: SortOrder
    markupPercent?: SortOrderInput | SortOrder
    minStockLevel?: SortOrder
    _count?: VariantCountOrderByAggregateInput
    _avg?: VariantAvgOrderByAggregateInput
    _max?: VariantMaxOrderByAggregateInput
    _min?: VariantMinOrderByAggregateInput
    _sum?: VariantSumOrderByAggregateInput
  }

  export type VariantScalarWhereWithAggregatesInput = {
    AND?: VariantScalarWhereWithAggregatesInput | VariantScalarWhereWithAggregatesInput[]
    OR?: VariantScalarWhereWithAggregatesInput[]
    NOT?: VariantScalarWhereWithAggregatesInput | VariantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Variant"> | string
    productId?: StringWithAggregatesFilter<"Variant"> | string
    sku?: StringWithAggregatesFilter<"Variant"> | string
    specifications?: JsonNullableWithAggregatesFilter<"Variant">
    purchasePrice?: FloatWithAggregatesFilter<"Variant"> | number
    sellingPrice?: FloatWithAggregatesFilter<"Variant"> | number
    pricingMethod?: StringWithAggregatesFilter<"Variant"> | string
    markupPercent?: FloatNullableWithAggregatesFilter<"Variant"> | number | null
    minStockLevel?: FloatWithAggregatesFilter<"Variant"> | number
  }

  export type StockWhereInput = {
    AND?: StockWhereInput | StockWhereInput[]
    OR?: StockWhereInput[]
    NOT?: StockWhereInput | StockWhereInput[]
    id?: StringFilter<"Stock"> | string
    variantId?: StringFilter<"Stock"> | string
    warehouseId?: StringNullableFilter<"Stock"> | string | null
    outletId?: StringNullableFilter<"Stock"> | string | null
    quantity?: FloatFilter<"Stock"> | number
    inTransitQty?: FloatFilter<"Stock"> | number
    variant?: XOR<VariantScalarRelationFilter, VariantWhereInput>
    warehouse?: XOR<WarehouseNullableScalarRelationFilter, WarehouseWhereInput> | null
    outlet?: XOR<OutletNullableScalarRelationFilter, OutletWhereInput> | null
  }

  export type StockOrderByWithRelationInput = {
    id?: SortOrder
    variantId?: SortOrder
    warehouseId?: SortOrderInput | SortOrder
    outletId?: SortOrderInput | SortOrder
    quantity?: SortOrder
    inTransitQty?: SortOrder
    variant?: VariantOrderByWithRelationInput
    warehouse?: WarehouseOrderByWithRelationInput
    outlet?: OutletOrderByWithRelationInput
  }

  export type StockWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    variantId_warehouseId_outletId?: StockVariantIdWarehouseIdOutletIdCompoundUniqueInput
    AND?: StockWhereInput | StockWhereInput[]
    OR?: StockWhereInput[]
    NOT?: StockWhereInput | StockWhereInput[]
    variantId?: StringFilter<"Stock"> | string
    warehouseId?: StringNullableFilter<"Stock"> | string | null
    outletId?: StringNullableFilter<"Stock"> | string | null
    quantity?: FloatFilter<"Stock"> | number
    inTransitQty?: FloatFilter<"Stock"> | number
    variant?: XOR<VariantScalarRelationFilter, VariantWhereInput>
    warehouse?: XOR<WarehouseNullableScalarRelationFilter, WarehouseWhereInput> | null
    outlet?: XOR<OutletNullableScalarRelationFilter, OutletWhereInput> | null
  }, "id" | "variantId_warehouseId_outletId">

  export type StockOrderByWithAggregationInput = {
    id?: SortOrder
    variantId?: SortOrder
    warehouseId?: SortOrderInput | SortOrder
    outletId?: SortOrderInput | SortOrder
    quantity?: SortOrder
    inTransitQty?: SortOrder
    _count?: StockCountOrderByAggregateInput
    _avg?: StockAvgOrderByAggregateInput
    _max?: StockMaxOrderByAggregateInput
    _min?: StockMinOrderByAggregateInput
    _sum?: StockSumOrderByAggregateInput
  }

  export type StockScalarWhereWithAggregatesInput = {
    AND?: StockScalarWhereWithAggregatesInput | StockScalarWhereWithAggregatesInput[]
    OR?: StockScalarWhereWithAggregatesInput[]
    NOT?: StockScalarWhereWithAggregatesInput | StockScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Stock"> | string
    variantId?: StringWithAggregatesFilter<"Stock"> | string
    warehouseId?: StringNullableWithAggregatesFilter<"Stock"> | string | null
    outletId?: StringNullableWithAggregatesFilter<"Stock"> | string | null
    quantity?: FloatWithAggregatesFilter<"Stock"> | number
    inTransitQty?: FloatWithAggregatesFilter<"Stock"> | number
  }

  export type PartyWhereInput = {
    AND?: PartyWhereInput | PartyWhereInput[]
    OR?: PartyWhereInput[]
    NOT?: PartyWhereInput | PartyWhereInput[]
    id?: StringFilter<"Party"> | string
    type?: EnumPartyTypeFilter<"Party"> | $Enums.PartyType
    name?: StringFilter<"Party"> | string
    gstin?: StringNullableFilter<"Party"> | string | null
    pan?: StringNullableFilter<"Party"> | string | null
    address?: StringFilter<"Party"> | string
    state?: StringFilter<"Party"> | string
    contactInfo?: StringNullableFilter<"Party"> | string | null
    creditPeriod?: IntFilter<"Party"> | number
    creditLimit?: FloatNullableFilter<"Party"> | number | null
    openingBalance?: FloatFilter<"Party"> | number
    transactions?: TransactionListRelationFilter
    ledgerEntries?: LedgerEntryListRelationFilter
    suppliedProducts?: VendorProductListRelationFilter
  }

  export type PartyOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    name?: SortOrder
    gstin?: SortOrderInput | SortOrder
    pan?: SortOrderInput | SortOrder
    address?: SortOrder
    state?: SortOrder
    contactInfo?: SortOrderInput | SortOrder
    creditPeriod?: SortOrder
    creditLimit?: SortOrderInput | SortOrder
    openingBalance?: SortOrder
    transactions?: TransactionOrderByRelationAggregateInput
    ledgerEntries?: LedgerEntryOrderByRelationAggregateInput
    suppliedProducts?: VendorProductOrderByRelationAggregateInput
  }

  export type PartyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PartyWhereInput | PartyWhereInput[]
    OR?: PartyWhereInput[]
    NOT?: PartyWhereInput | PartyWhereInput[]
    type?: EnumPartyTypeFilter<"Party"> | $Enums.PartyType
    name?: StringFilter<"Party"> | string
    gstin?: StringNullableFilter<"Party"> | string | null
    pan?: StringNullableFilter<"Party"> | string | null
    address?: StringFilter<"Party"> | string
    state?: StringFilter<"Party"> | string
    contactInfo?: StringNullableFilter<"Party"> | string | null
    creditPeriod?: IntFilter<"Party"> | number
    creditLimit?: FloatNullableFilter<"Party"> | number | null
    openingBalance?: FloatFilter<"Party"> | number
    transactions?: TransactionListRelationFilter
    ledgerEntries?: LedgerEntryListRelationFilter
    suppliedProducts?: VendorProductListRelationFilter
  }, "id">

  export type PartyOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    name?: SortOrder
    gstin?: SortOrderInput | SortOrder
    pan?: SortOrderInput | SortOrder
    address?: SortOrder
    state?: SortOrder
    contactInfo?: SortOrderInput | SortOrder
    creditPeriod?: SortOrder
    creditLimit?: SortOrderInput | SortOrder
    openingBalance?: SortOrder
    _count?: PartyCountOrderByAggregateInput
    _avg?: PartyAvgOrderByAggregateInput
    _max?: PartyMaxOrderByAggregateInput
    _min?: PartyMinOrderByAggregateInput
    _sum?: PartySumOrderByAggregateInput
  }

  export type PartyScalarWhereWithAggregatesInput = {
    AND?: PartyScalarWhereWithAggregatesInput | PartyScalarWhereWithAggregatesInput[]
    OR?: PartyScalarWhereWithAggregatesInput[]
    NOT?: PartyScalarWhereWithAggregatesInput | PartyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Party"> | string
    type?: EnumPartyTypeWithAggregatesFilter<"Party"> | $Enums.PartyType
    name?: StringWithAggregatesFilter<"Party"> | string
    gstin?: StringNullableWithAggregatesFilter<"Party"> | string | null
    pan?: StringNullableWithAggregatesFilter<"Party"> | string | null
    address?: StringWithAggregatesFilter<"Party"> | string
    state?: StringWithAggregatesFilter<"Party"> | string
    contactInfo?: StringNullableWithAggregatesFilter<"Party"> | string | null
    creditPeriod?: IntWithAggregatesFilter<"Party"> | number
    creditLimit?: FloatNullableWithAggregatesFilter<"Party"> | number | null
    openingBalance?: FloatWithAggregatesFilter<"Party"> | number
  }

  export type TransactionWhereInput = {
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    id?: StringFilter<"Transaction"> | string
    type?: EnumTxTypeFilter<"Transaction"> | $Enums.TxType
    txnNumber?: StringFilter<"Transaction"> | string
    date?: DateTimeFilter<"Transaction"> | Date | string
    partyId?: StringNullableFilter<"Transaction"> | string | null
    fromLocationId?: StringNullableFilter<"Transaction"> | string | null
    toLocationId?: StringNullableFilter<"Transaction"> | string | null
    totalTaxable?: FloatFilter<"Transaction"> | number
    totalTax?: FloatFilter<"Transaction"> | number
    freightCost?: FloatNullableFilter<"Transaction"> | number | null
    grandTotal?: FloatFilter<"Transaction"> | number
    status?: StringFilter<"Transaction"> | string
    parentId?: StringNullableFilter<"Transaction"> | string | null
    party?: XOR<PartyNullableScalarRelationFilter, PartyWhereInput> | null
    parent?: XOR<TransactionNullableScalarRelationFilter, TransactionWhereInput> | null
    children?: TransactionListRelationFilter
    items?: TransactionItemListRelationFilter
    ledgerEntries?: LedgerEntryListRelationFilter
  }

  export type TransactionOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    txnNumber?: SortOrder
    date?: SortOrder
    partyId?: SortOrderInput | SortOrder
    fromLocationId?: SortOrderInput | SortOrder
    toLocationId?: SortOrderInput | SortOrder
    totalTaxable?: SortOrder
    totalTax?: SortOrder
    freightCost?: SortOrderInput | SortOrder
    grandTotal?: SortOrder
    status?: SortOrder
    parentId?: SortOrderInput | SortOrder
    party?: PartyOrderByWithRelationInput
    parent?: TransactionOrderByWithRelationInput
    children?: TransactionOrderByRelationAggregateInput
    items?: TransactionItemOrderByRelationAggregateInput
    ledgerEntries?: LedgerEntryOrderByRelationAggregateInput
  }

  export type TransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    txnNumber?: string
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    type?: EnumTxTypeFilter<"Transaction"> | $Enums.TxType
    date?: DateTimeFilter<"Transaction"> | Date | string
    partyId?: StringNullableFilter<"Transaction"> | string | null
    fromLocationId?: StringNullableFilter<"Transaction"> | string | null
    toLocationId?: StringNullableFilter<"Transaction"> | string | null
    totalTaxable?: FloatFilter<"Transaction"> | number
    totalTax?: FloatFilter<"Transaction"> | number
    freightCost?: FloatNullableFilter<"Transaction"> | number | null
    grandTotal?: FloatFilter<"Transaction"> | number
    status?: StringFilter<"Transaction"> | string
    parentId?: StringNullableFilter<"Transaction"> | string | null
    party?: XOR<PartyNullableScalarRelationFilter, PartyWhereInput> | null
    parent?: XOR<TransactionNullableScalarRelationFilter, TransactionWhereInput> | null
    children?: TransactionListRelationFilter
    items?: TransactionItemListRelationFilter
    ledgerEntries?: LedgerEntryListRelationFilter
  }, "id" | "txnNumber">

  export type TransactionOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    txnNumber?: SortOrder
    date?: SortOrder
    partyId?: SortOrderInput | SortOrder
    fromLocationId?: SortOrderInput | SortOrder
    toLocationId?: SortOrderInput | SortOrder
    totalTaxable?: SortOrder
    totalTax?: SortOrder
    freightCost?: SortOrderInput | SortOrder
    grandTotal?: SortOrder
    status?: SortOrder
    parentId?: SortOrderInput | SortOrder
    _count?: TransactionCountOrderByAggregateInput
    _avg?: TransactionAvgOrderByAggregateInput
    _max?: TransactionMaxOrderByAggregateInput
    _min?: TransactionMinOrderByAggregateInput
    _sum?: TransactionSumOrderByAggregateInput
  }

  export type TransactionScalarWhereWithAggregatesInput = {
    AND?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    OR?: TransactionScalarWhereWithAggregatesInput[]
    NOT?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Transaction"> | string
    type?: EnumTxTypeWithAggregatesFilter<"Transaction"> | $Enums.TxType
    txnNumber?: StringWithAggregatesFilter<"Transaction"> | string
    date?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
    partyId?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    fromLocationId?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    toLocationId?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    totalTaxable?: FloatWithAggregatesFilter<"Transaction"> | number
    totalTax?: FloatWithAggregatesFilter<"Transaction"> | number
    freightCost?: FloatNullableWithAggregatesFilter<"Transaction"> | number | null
    grandTotal?: FloatWithAggregatesFilter<"Transaction"> | number
    status?: StringWithAggregatesFilter<"Transaction"> | string
    parentId?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
  }

  export type TransactionItemWhereInput = {
    AND?: TransactionItemWhereInput | TransactionItemWhereInput[]
    OR?: TransactionItemWhereInput[]
    NOT?: TransactionItemWhereInput | TransactionItemWhereInput[]
    id?: StringFilter<"TransactionItem"> | string
    transactionId?: StringFilter<"TransactionItem"> | string
    variantId?: StringFilter<"TransactionItem"> | string
    quantity?: FloatFilter<"TransactionItem"> | number
    rate?: FloatFilter<"TransactionItem"> | number
    freightFraction?: FloatNullableFilter<"TransactionItem"> | number | null
    taxableValue?: FloatFilter<"TransactionItem"> | number
    cgst?: FloatFilter<"TransactionItem"> | number
    sgst?: FloatFilter<"TransactionItem"> | number
    igst?: FloatFilter<"TransactionItem"> | number
    transaction?: XOR<TransactionScalarRelationFilter, TransactionWhereInput>
    variant?: XOR<VariantScalarRelationFilter, VariantWhereInput>
  }

  export type TransactionItemOrderByWithRelationInput = {
    id?: SortOrder
    transactionId?: SortOrder
    variantId?: SortOrder
    quantity?: SortOrder
    rate?: SortOrder
    freightFraction?: SortOrderInput | SortOrder
    taxableValue?: SortOrder
    cgst?: SortOrder
    sgst?: SortOrder
    igst?: SortOrder
    transaction?: TransactionOrderByWithRelationInput
    variant?: VariantOrderByWithRelationInput
  }

  export type TransactionItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TransactionItemWhereInput | TransactionItemWhereInput[]
    OR?: TransactionItemWhereInput[]
    NOT?: TransactionItemWhereInput | TransactionItemWhereInput[]
    transactionId?: StringFilter<"TransactionItem"> | string
    variantId?: StringFilter<"TransactionItem"> | string
    quantity?: FloatFilter<"TransactionItem"> | number
    rate?: FloatFilter<"TransactionItem"> | number
    freightFraction?: FloatNullableFilter<"TransactionItem"> | number | null
    taxableValue?: FloatFilter<"TransactionItem"> | number
    cgst?: FloatFilter<"TransactionItem"> | number
    sgst?: FloatFilter<"TransactionItem"> | number
    igst?: FloatFilter<"TransactionItem"> | number
    transaction?: XOR<TransactionScalarRelationFilter, TransactionWhereInput>
    variant?: XOR<VariantScalarRelationFilter, VariantWhereInput>
  }, "id">

  export type TransactionItemOrderByWithAggregationInput = {
    id?: SortOrder
    transactionId?: SortOrder
    variantId?: SortOrder
    quantity?: SortOrder
    rate?: SortOrder
    freightFraction?: SortOrderInput | SortOrder
    taxableValue?: SortOrder
    cgst?: SortOrder
    sgst?: SortOrder
    igst?: SortOrder
    _count?: TransactionItemCountOrderByAggregateInput
    _avg?: TransactionItemAvgOrderByAggregateInput
    _max?: TransactionItemMaxOrderByAggregateInput
    _min?: TransactionItemMinOrderByAggregateInput
    _sum?: TransactionItemSumOrderByAggregateInput
  }

  export type TransactionItemScalarWhereWithAggregatesInput = {
    AND?: TransactionItemScalarWhereWithAggregatesInput | TransactionItemScalarWhereWithAggregatesInput[]
    OR?: TransactionItemScalarWhereWithAggregatesInput[]
    NOT?: TransactionItemScalarWhereWithAggregatesInput | TransactionItemScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TransactionItem"> | string
    transactionId?: StringWithAggregatesFilter<"TransactionItem"> | string
    variantId?: StringWithAggregatesFilter<"TransactionItem"> | string
    quantity?: FloatWithAggregatesFilter<"TransactionItem"> | number
    rate?: FloatWithAggregatesFilter<"TransactionItem"> | number
    freightFraction?: FloatNullableWithAggregatesFilter<"TransactionItem"> | number | null
    taxableValue?: FloatWithAggregatesFilter<"TransactionItem"> | number
    cgst?: FloatWithAggregatesFilter<"TransactionItem"> | number
    sgst?: FloatWithAggregatesFilter<"TransactionItem"> | number
    igst?: FloatWithAggregatesFilter<"TransactionItem"> | number
  }

  export type AccountWhereInput = {
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    id?: StringFilter<"Account"> | string
    code?: StringFilter<"Account"> | string
    name?: StringFilter<"Account"> | string
    group?: EnumAccountGroupFilter<"Account"> | $Enums.AccountGroup
    isSystem?: BoolFilter<"Account"> | boolean
    entries?: LedgerEntryListRelationFilter
  }

  export type AccountOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    group?: SortOrder
    isSystem?: SortOrder
    entries?: LedgerEntryOrderByRelationAggregateInput
  }

  export type AccountWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: AccountWhereInput | AccountWhereInput[]
    OR?: AccountWhereInput[]
    NOT?: AccountWhereInput | AccountWhereInput[]
    name?: StringFilter<"Account"> | string
    group?: EnumAccountGroupFilter<"Account"> | $Enums.AccountGroup
    isSystem?: BoolFilter<"Account"> | boolean
    entries?: LedgerEntryListRelationFilter
  }, "id" | "code">

  export type AccountOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    group?: SortOrder
    isSystem?: SortOrder
    _count?: AccountCountOrderByAggregateInput
    _max?: AccountMaxOrderByAggregateInput
    _min?: AccountMinOrderByAggregateInput
  }

  export type AccountScalarWhereWithAggregatesInput = {
    AND?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    OR?: AccountScalarWhereWithAggregatesInput[]
    NOT?: AccountScalarWhereWithAggregatesInput | AccountScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Account"> | string
    code?: StringWithAggregatesFilter<"Account"> | string
    name?: StringWithAggregatesFilter<"Account"> | string
    group?: EnumAccountGroupWithAggregatesFilter<"Account"> | $Enums.AccountGroup
    isSystem?: BoolWithAggregatesFilter<"Account"> | boolean
  }

  export type LedgerEntryWhereInput = {
    AND?: LedgerEntryWhereInput | LedgerEntryWhereInput[]
    OR?: LedgerEntryWhereInput[]
    NOT?: LedgerEntryWhereInput | LedgerEntryWhereInput[]
    id?: StringFilter<"LedgerEntry"> | string
    accountId?: StringFilter<"LedgerEntry"> | string
    partyId?: StringNullableFilter<"LedgerEntry"> | string | null
    transactionId?: StringNullableFilter<"LedgerEntry"> | string | null
    date?: DateTimeFilter<"LedgerEntry"> | Date | string
    debit?: FloatFilter<"LedgerEntry"> | number
    credit?: FloatFilter<"LedgerEntry"> | number
    reference?: StringNullableFilter<"LedgerEntry"> | string | null
    isReconciled?: BoolFilter<"LedgerEntry"> | boolean
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
    party?: XOR<PartyNullableScalarRelationFilter, PartyWhereInput> | null
    transaction?: XOR<TransactionNullableScalarRelationFilter, TransactionWhereInput> | null
  }

  export type LedgerEntryOrderByWithRelationInput = {
    id?: SortOrder
    accountId?: SortOrder
    partyId?: SortOrderInput | SortOrder
    transactionId?: SortOrderInput | SortOrder
    date?: SortOrder
    debit?: SortOrder
    credit?: SortOrder
    reference?: SortOrderInput | SortOrder
    isReconciled?: SortOrder
    account?: AccountOrderByWithRelationInput
    party?: PartyOrderByWithRelationInput
    transaction?: TransactionOrderByWithRelationInput
  }

  export type LedgerEntryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LedgerEntryWhereInput | LedgerEntryWhereInput[]
    OR?: LedgerEntryWhereInput[]
    NOT?: LedgerEntryWhereInput | LedgerEntryWhereInput[]
    accountId?: StringFilter<"LedgerEntry"> | string
    partyId?: StringNullableFilter<"LedgerEntry"> | string | null
    transactionId?: StringNullableFilter<"LedgerEntry"> | string | null
    date?: DateTimeFilter<"LedgerEntry"> | Date | string
    debit?: FloatFilter<"LedgerEntry"> | number
    credit?: FloatFilter<"LedgerEntry"> | number
    reference?: StringNullableFilter<"LedgerEntry"> | string | null
    isReconciled?: BoolFilter<"LedgerEntry"> | boolean
    account?: XOR<AccountScalarRelationFilter, AccountWhereInput>
    party?: XOR<PartyNullableScalarRelationFilter, PartyWhereInput> | null
    transaction?: XOR<TransactionNullableScalarRelationFilter, TransactionWhereInput> | null
  }, "id">

  export type LedgerEntryOrderByWithAggregationInput = {
    id?: SortOrder
    accountId?: SortOrder
    partyId?: SortOrderInput | SortOrder
    transactionId?: SortOrderInput | SortOrder
    date?: SortOrder
    debit?: SortOrder
    credit?: SortOrder
    reference?: SortOrderInput | SortOrder
    isReconciled?: SortOrder
    _count?: LedgerEntryCountOrderByAggregateInput
    _avg?: LedgerEntryAvgOrderByAggregateInput
    _max?: LedgerEntryMaxOrderByAggregateInput
    _min?: LedgerEntryMinOrderByAggregateInput
    _sum?: LedgerEntrySumOrderByAggregateInput
  }

  export type LedgerEntryScalarWhereWithAggregatesInput = {
    AND?: LedgerEntryScalarWhereWithAggregatesInput | LedgerEntryScalarWhereWithAggregatesInput[]
    OR?: LedgerEntryScalarWhereWithAggregatesInput[]
    NOT?: LedgerEntryScalarWhereWithAggregatesInput | LedgerEntryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LedgerEntry"> | string
    accountId?: StringWithAggregatesFilter<"LedgerEntry"> | string
    partyId?: StringNullableWithAggregatesFilter<"LedgerEntry"> | string | null
    transactionId?: StringNullableWithAggregatesFilter<"LedgerEntry"> | string | null
    date?: DateTimeWithAggregatesFilter<"LedgerEntry"> | Date | string
    debit?: FloatWithAggregatesFilter<"LedgerEntry"> | number
    credit?: FloatWithAggregatesFilter<"LedgerEntry"> | number
    reference?: StringNullableWithAggregatesFilter<"LedgerEntry"> | string | null
    isReconciled?: BoolWithAggregatesFilter<"LedgerEntry"> | boolean
  }

  export type VendorProductWhereInput = {
    AND?: VendorProductWhereInput | VendorProductWhereInput[]
    OR?: VendorProductWhereInput[]
    NOT?: VendorProductWhereInput | VendorProductWhereInput[]
    id?: StringFilter<"VendorProduct"> | string
    vendorId?: StringFilter<"VendorProduct"> | string
    variantId?: StringFilter<"VendorProduct"> | string
    lastPrice?: FloatNullableFilter<"VendorProduct"> | number | null
    leadTime?: IntNullableFilter<"VendorProduct"> | number | null
    vendor?: XOR<PartyScalarRelationFilter, PartyWhereInput>
    variant?: XOR<VariantScalarRelationFilter, VariantWhereInput>
  }

  export type VendorProductOrderByWithRelationInput = {
    id?: SortOrder
    vendorId?: SortOrder
    variantId?: SortOrder
    lastPrice?: SortOrderInput | SortOrder
    leadTime?: SortOrderInput | SortOrder
    vendor?: PartyOrderByWithRelationInput
    variant?: VariantOrderByWithRelationInput
  }

  export type VendorProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    vendorId_variantId?: VendorProductVendorIdVariantIdCompoundUniqueInput
    AND?: VendorProductWhereInput | VendorProductWhereInput[]
    OR?: VendorProductWhereInput[]
    NOT?: VendorProductWhereInput | VendorProductWhereInput[]
    vendorId?: StringFilter<"VendorProduct"> | string
    variantId?: StringFilter<"VendorProduct"> | string
    lastPrice?: FloatNullableFilter<"VendorProduct"> | number | null
    leadTime?: IntNullableFilter<"VendorProduct"> | number | null
    vendor?: XOR<PartyScalarRelationFilter, PartyWhereInput>
    variant?: XOR<VariantScalarRelationFilter, VariantWhereInput>
  }, "id" | "vendorId_variantId">

  export type VendorProductOrderByWithAggregationInput = {
    id?: SortOrder
    vendorId?: SortOrder
    variantId?: SortOrder
    lastPrice?: SortOrderInput | SortOrder
    leadTime?: SortOrderInput | SortOrder
    _count?: VendorProductCountOrderByAggregateInput
    _avg?: VendorProductAvgOrderByAggregateInput
    _max?: VendorProductMaxOrderByAggregateInput
    _min?: VendorProductMinOrderByAggregateInput
    _sum?: VendorProductSumOrderByAggregateInput
  }

  export type VendorProductScalarWhereWithAggregatesInput = {
    AND?: VendorProductScalarWhereWithAggregatesInput | VendorProductScalarWhereWithAggregatesInput[]
    OR?: VendorProductScalarWhereWithAggregatesInput[]
    NOT?: VendorProductScalarWhereWithAggregatesInput | VendorProductScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"VendorProduct"> | string
    vendorId?: StringWithAggregatesFilter<"VendorProduct"> | string
    variantId?: StringWithAggregatesFilter<"VendorProduct"> | string
    lastPrice?: FloatNullableWithAggregatesFilter<"VendorProduct"> | number | null
    leadTime?: IntNullableWithAggregatesFilter<"VendorProduct"> | number | null
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name: string
    role: $Enums.Role
    password: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    outlets?: OutletCreateNestedManyWithoutUsersInput
    actions?: AuditLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name: string
    role: $Enums.Role
    password: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    outlets?: OutletUncheckedCreateNestedManyWithoutUsersInput
    actions?: AuditLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outlets?: OutletUpdateManyWithoutUsersNestedInput
    actions?: AuditLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outlets?: OutletUncheckedUpdateManyWithoutUsersNestedInput
    actions?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name: string
    role: $Enums.Role
    password: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateInput = {
    id?: string
    action: string
    entity: string
    entityId: string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    user: UserCreateNestedOneWithoutActionsInput
  }

  export type AuditLogUncheckedCreateInput = {
    id?: string
    userId: string
    action: string
    entity: string
    entityId: string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutActionsNestedInput
  }

  export type AuditLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogCreateManyInput = {
    id?: string
    userId: string
    action: string
    entity: string
    entityId: string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WarehouseCreateInput = {
    id?: string
    name: string
    address?: string | null
    outlets?: OutletCreateNestedManyWithoutWarehousesInput
    stocks?: StockCreateNestedManyWithoutWarehouseInput
  }

  export type WarehouseUncheckedCreateInput = {
    id?: string
    name: string
    address?: string | null
    outlets?: OutletUncheckedCreateNestedManyWithoutWarehousesInput
    stocks?: StockUncheckedCreateNestedManyWithoutWarehouseInput
  }

  export type WarehouseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    outlets?: OutletUpdateManyWithoutWarehousesNestedInput
    stocks?: StockUpdateManyWithoutWarehouseNestedInput
  }

  export type WarehouseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    outlets?: OutletUncheckedUpdateManyWithoutWarehousesNestedInput
    stocks?: StockUncheckedUpdateManyWithoutWarehouseNestedInput
  }

  export type WarehouseCreateManyInput = {
    id?: string
    name: string
    address?: string | null
  }

  export type WarehouseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type WarehouseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type OutletCreateInput = {
    id?: string
    name: string
    invoicePrefix: string
    gstin?: string | null
    bankDetails?: string | null
    negativeStockPolicy?: string
    warehouses?: WarehouseCreateNestedManyWithoutOutletsInput
    users?: UserCreateNestedManyWithoutOutletsInput
    stocks?: StockCreateNestedManyWithoutOutletInput
  }

  export type OutletUncheckedCreateInput = {
    id?: string
    name: string
    invoicePrefix: string
    gstin?: string | null
    bankDetails?: string | null
    negativeStockPolicy?: string
    warehouses?: WarehouseUncheckedCreateNestedManyWithoutOutletsInput
    users?: UserUncheckedCreateNestedManyWithoutOutletsInput
    stocks?: StockUncheckedCreateNestedManyWithoutOutletInput
  }

  export type OutletUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
    warehouses?: WarehouseUpdateManyWithoutOutletsNestedInput
    users?: UserUpdateManyWithoutOutletsNestedInput
    stocks?: StockUpdateManyWithoutOutletNestedInput
  }

  export type OutletUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
    warehouses?: WarehouseUncheckedUpdateManyWithoutOutletsNestedInput
    users?: UserUncheckedUpdateManyWithoutOutletsNestedInput
    stocks?: StockUncheckedUpdateManyWithoutOutletNestedInput
  }

  export type OutletCreateManyInput = {
    id?: string
    name: string
    invoicePrefix: string
    gstin?: string | null
    bankDetails?: string | null
    negativeStockPolicy?: string
  }

  export type OutletUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
  }

  export type OutletUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
  }

  export type CategoryCreateInput = {
    id?: string
    name: string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    children?: CategoryCreateNestedManyWithoutParentInput
    products?: ProductCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateInput = {
    id?: string
    name: string
    parentId?: string | null
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
    products?: ProductUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    children?: CategoryUpdateManyWithoutParentNestedInput
    products?: ProductUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
    products?: ProductUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryCreateManyInput = {
    id?: string
    name: string
    parentId?: string | null
  }

  export type CategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type CategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProductCreateInput = {
    id?: string
    name: string
    brand?: string | null
    hsnCode: string
    gstRate: number
    baseUnit: string
    purchaseUnit?: string | null
    salesUnit?: string | null
    conversionRatio?: number | null
    isArchived?: boolean
    category: CategoryCreateNestedOneWithoutProductsInput
    variants?: VariantCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateInput = {
    id?: string
    name: string
    brand?: string | null
    hsnCode: string
    gstRate: number
    baseUnit: string
    purchaseUnit?: string | null
    salesUnit?: string | null
    conversionRatio?: number | null
    categoryId: string
    isArchived?: boolean
    variants?: VariantUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brand?: NullableStringFieldUpdateOperationsInput | string | null
    hsnCode?: StringFieldUpdateOperationsInput | string
    gstRate?: FloatFieldUpdateOperationsInput | number
    baseUnit?: StringFieldUpdateOperationsInput | string
    purchaseUnit?: NullableStringFieldUpdateOperationsInput | string | null
    salesUnit?: NullableStringFieldUpdateOperationsInput | string | null
    conversionRatio?: NullableFloatFieldUpdateOperationsInput | number | null
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    category?: CategoryUpdateOneRequiredWithoutProductsNestedInput
    variants?: VariantUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brand?: NullableStringFieldUpdateOperationsInput | string | null
    hsnCode?: StringFieldUpdateOperationsInput | string
    gstRate?: FloatFieldUpdateOperationsInput | number
    baseUnit?: StringFieldUpdateOperationsInput | string
    purchaseUnit?: NullableStringFieldUpdateOperationsInput | string | null
    salesUnit?: NullableStringFieldUpdateOperationsInput | string | null
    conversionRatio?: NullableFloatFieldUpdateOperationsInput | number | null
    categoryId?: StringFieldUpdateOperationsInput | string
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    variants?: VariantUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductCreateManyInput = {
    id?: string
    name: string
    brand?: string | null
    hsnCode: string
    gstRate: number
    baseUnit: string
    purchaseUnit?: string | null
    salesUnit?: string | null
    conversionRatio?: number | null
    categoryId: string
    isArchived?: boolean
  }

  export type ProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brand?: NullableStringFieldUpdateOperationsInput | string | null
    hsnCode?: StringFieldUpdateOperationsInput | string
    gstRate?: FloatFieldUpdateOperationsInput | number
    baseUnit?: StringFieldUpdateOperationsInput | string
    purchaseUnit?: NullableStringFieldUpdateOperationsInput | string | null
    salesUnit?: NullableStringFieldUpdateOperationsInput | string | null
    conversionRatio?: NullableFloatFieldUpdateOperationsInput | number | null
    isArchived?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brand?: NullableStringFieldUpdateOperationsInput | string | null
    hsnCode?: StringFieldUpdateOperationsInput | string
    gstRate?: FloatFieldUpdateOperationsInput | number
    baseUnit?: StringFieldUpdateOperationsInput | string
    purchaseUnit?: NullableStringFieldUpdateOperationsInput | string | null
    salesUnit?: NullableStringFieldUpdateOperationsInput | string | null
    conversionRatio?: NullableFloatFieldUpdateOperationsInput | number | null
    categoryId?: StringFieldUpdateOperationsInput | string
    isArchived?: BoolFieldUpdateOperationsInput | boolean
  }

  export type VariantCreateInput = {
    id?: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
    product: ProductCreateNestedOneWithoutVariantsInput
    stocks?: StockCreateNestedManyWithoutVariantInput
    txnItems?: TransactionItemCreateNestedManyWithoutVariantInput
    suppliers?: VendorProductCreateNestedManyWithoutVariantInput
  }

  export type VariantUncheckedCreateInput = {
    id?: string
    productId: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
    stocks?: StockUncheckedCreateNestedManyWithoutVariantInput
    txnItems?: TransactionItemUncheckedCreateNestedManyWithoutVariantInput
    suppliers?: VendorProductUncheckedCreateNestedManyWithoutVariantInput
  }

  export type VariantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
    product?: ProductUpdateOneRequiredWithoutVariantsNestedInput
    stocks?: StockUpdateManyWithoutVariantNestedInput
    txnItems?: TransactionItemUpdateManyWithoutVariantNestedInput
    suppliers?: VendorProductUpdateManyWithoutVariantNestedInput
  }

  export type VariantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
    stocks?: StockUncheckedUpdateManyWithoutVariantNestedInput
    txnItems?: TransactionItemUncheckedUpdateManyWithoutVariantNestedInput
    suppliers?: VendorProductUncheckedUpdateManyWithoutVariantNestedInput
  }

  export type VariantCreateManyInput = {
    id?: string
    productId: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
  }

  export type VariantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
  }

  export type VariantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
  }

  export type StockCreateInput = {
    id?: string
    quantity?: number
    inTransitQty?: number
    variant: VariantCreateNestedOneWithoutStocksInput
    warehouse?: WarehouseCreateNestedOneWithoutStocksInput
    outlet?: OutletCreateNestedOneWithoutStocksInput
  }

  export type StockUncheckedCreateInput = {
    id?: string
    variantId: string
    warehouseId?: string | null
    outletId?: string | null
    quantity?: number
    inTransitQty?: number
  }

  export type StockUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
    variant?: VariantUpdateOneRequiredWithoutStocksNestedInput
    warehouse?: WarehouseUpdateOneWithoutStocksNestedInput
    outlet?: OutletUpdateOneWithoutStocksNestedInput
  }

  export type StockUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    warehouseId?: NullableStringFieldUpdateOperationsInput | string | null
    outletId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
  }

  export type StockCreateManyInput = {
    id?: string
    variantId: string
    warehouseId?: string | null
    outletId?: string | null
    quantity?: number
    inTransitQty?: number
  }

  export type StockUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
  }

  export type StockUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    warehouseId?: NullableStringFieldUpdateOperationsInput | string | null
    outletId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
  }

  export type PartyCreateInput = {
    id?: string
    type: $Enums.PartyType
    name: string
    gstin?: string | null
    pan?: string | null
    address: string
    state: string
    contactInfo?: string | null
    creditPeriod?: number
    creditLimit?: number | null
    openingBalance?: number
    transactions?: TransactionCreateNestedManyWithoutPartyInput
    ledgerEntries?: LedgerEntryCreateNestedManyWithoutPartyInput
    suppliedProducts?: VendorProductCreateNestedManyWithoutVendorInput
  }

  export type PartyUncheckedCreateInput = {
    id?: string
    type: $Enums.PartyType
    name: string
    gstin?: string | null
    pan?: string | null
    address: string
    state: string
    contactInfo?: string | null
    creditPeriod?: number
    creditLimit?: number | null
    openingBalance?: number
    transactions?: TransactionUncheckedCreateNestedManyWithoutPartyInput
    ledgerEntries?: LedgerEntryUncheckedCreateNestedManyWithoutPartyInput
    suppliedProducts?: VendorProductUncheckedCreateNestedManyWithoutVendorInput
  }

  export type PartyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPartyTypeFieldUpdateOperationsInput | $Enums.PartyType
    name?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    contactInfo?: NullableStringFieldUpdateOperationsInput | string | null
    creditPeriod?: IntFieldUpdateOperationsInput | number
    creditLimit?: NullableFloatFieldUpdateOperationsInput | number | null
    openingBalance?: FloatFieldUpdateOperationsInput | number
    transactions?: TransactionUpdateManyWithoutPartyNestedInput
    ledgerEntries?: LedgerEntryUpdateManyWithoutPartyNestedInput
    suppliedProducts?: VendorProductUpdateManyWithoutVendorNestedInput
  }

  export type PartyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPartyTypeFieldUpdateOperationsInput | $Enums.PartyType
    name?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    contactInfo?: NullableStringFieldUpdateOperationsInput | string | null
    creditPeriod?: IntFieldUpdateOperationsInput | number
    creditLimit?: NullableFloatFieldUpdateOperationsInput | number | null
    openingBalance?: FloatFieldUpdateOperationsInput | number
    transactions?: TransactionUncheckedUpdateManyWithoutPartyNestedInput
    ledgerEntries?: LedgerEntryUncheckedUpdateManyWithoutPartyNestedInput
    suppliedProducts?: VendorProductUncheckedUpdateManyWithoutVendorNestedInput
  }

  export type PartyCreateManyInput = {
    id?: string
    type: $Enums.PartyType
    name: string
    gstin?: string | null
    pan?: string | null
    address: string
    state: string
    contactInfo?: string | null
    creditPeriod?: number
    creditLimit?: number | null
    openingBalance?: number
  }

  export type PartyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPartyTypeFieldUpdateOperationsInput | $Enums.PartyType
    name?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    contactInfo?: NullableStringFieldUpdateOperationsInput | string | null
    creditPeriod?: IntFieldUpdateOperationsInput | number
    creditLimit?: NullableFloatFieldUpdateOperationsInput | number | null
    openingBalance?: FloatFieldUpdateOperationsInput | number
  }

  export type PartyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPartyTypeFieldUpdateOperationsInput | $Enums.PartyType
    name?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    contactInfo?: NullableStringFieldUpdateOperationsInput | string | null
    creditPeriod?: IntFieldUpdateOperationsInput | number
    creditLimit?: NullableFloatFieldUpdateOperationsInput | number | null
    openingBalance?: FloatFieldUpdateOperationsInput | number
  }

  export type TransactionCreateInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    party?: PartyCreateNestedOneWithoutTransactionsInput
    parent?: TransactionCreateNestedOneWithoutChildrenInput
    children?: TransactionCreateNestedManyWithoutParentInput
    items?: TransactionItemCreateNestedManyWithoutTransactionInput
    ledgerEntries?: LedgerEntryCreateNestedManyWithoutTransactionInput
  }

  export type TransactionUncheckedCreateInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    partyId?: string | null
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    parentId?: string | null
    children?: TransactionUncheckedCreateNestedManyWithoutParentInput
    items?: TransactionItemUncheckedCreateNestedManyWithoutTransactionInput
    ledgerEntries?: LedgerEntryUncheckedCreateNestedManyWithoutTransactionInput
  }

  export type TransactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    party?: PartyUpdateOneWithoutTransactionsNestedInput
    parent?: TransactionUpdateOneWithoutChildrenNestedInput
    children?: TransactionUpdateManyWithoutParentNestedInput
    items?: TransactionItemUpdateManyWithoutTransactionNestedInput
    ledgerEntries?: LedgerEntryUpdateManyWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    children?: TransactionUncheckedUpdateManyWithoutParentNestedInput
    items?: TransactionItemUncheckedUpdateManyWithoutTransactionNestedInput
    ledgerEntries?: LedgerEntryUncheckedUpdateManyWithoutTransactionNestedInput
  }

  export type TransactionCreateManyInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    partyId?: string | null
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    parentId?: string | null
  }

  export type TransactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
  }

  export type TransactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TransactionItemCreateInput = {
    id?: string
    quantity: number
    rate: number
    freightFraction?: number | null
    taxableValue: number
    cgst?: number
    sgst?: number
    igst?: number
    transaction: TransactionCreateNestedOneWithoutItemsInput
    variant: VariantCreateNestedOneWithoutTxnItemsInput
  }

  export type TransactionItemUncheckedCreateInput = {
    id?: string
    transactionId: string
    variantId: string
    quantity: number
    rate: number
    freightFraction?: number | null
    taxableValue: number
    cgst?: number
    sgst?: number
    igst?: number
  }

  export type TransactionItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    rate?: FloatFieldUpdateOperationsInput | number
    freightFraction?: NullableFloatFieldUpdateOperationsInput | number | null
    taxableValue?: FloatFieldUpdateOperationsInput | number
    cgst?: FloatFieldUpdateOperationsInput | number
    sgst?: FloatFieldUpdateOperationsInput | number
    igst?: FloatFieldUpdateOperationsInput | number
    transaction?: TransactionUpdateOneRequiredWithoutItemsNestedInput
    variant?: VariantUpdateOneRequiredWithoutTxnItemsNestedInput
  }

  export type TransactionItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    rate?: FloatFieldUpdateOperationsInput | number
    freightFraction?: NullableFloatFieldUpdateOperationsInput | number | null
    taxableValue?: FloatFieldUpdateOperationsInput | number
    cgst?: FloatFieldUpdateOperationsInput | number
    sgst?: FloatFieldUpdateOperationsInput | number
    igst?: FloatFieldUpdateOperationsInput | number
  }

  export type TransactionItemCreateManyInput = {
    id?: string
    transactionId: string
    variantId: string
    quantity: number
    rate: number
    freightFraction?: number | null
    taxableValue: number
    cgst?: number
    sgst?: number
    igst?: number
  }

  export type TransactionItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    rate?: FloatFieldUpdateOperationsInput | number
    freightFraction?: NullableFloatFieldUpdateOperationsInput | number | null
    taxableValue?: FloatFieldUpdateOperationsInput | number
    cgst?: FloatFieldUpdateOperationsInput | number
    sgst?: FloatFieldUpdateOperationsInput | number
    igst?: FloatFieldUpdateOperationsInput | number
  }

  export type TransactionItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    rate?: FloatFieldUpdateOperationsInput | number
    freightFraction?: NullableFloatFieldUpdateOperationsInput | number | null
    taxableValue?: FloatFieldUpdateOperationsInput | number
    cgst?: FloatFieldUpdateOperationsInput | number
    sgst?: FloatFieldUpdateOperationsInput | number
    igst?: FloatFieldUpdateOperationsInput | number
  }

  export type AccountCreateInput = {
    id?: string
    code: string
    name: string
    group: $Enums.AccountGroup
    isSystem?: boolean
    entries?: LedgerEntryCreateNestedManyWithoutAccountInput
  }

  export type AccountUncheckedCreateInput = {
    id?: string
    code: string
    name: string
    group: $Enums.AccountGroup
    isSystem?: boolean
    entries?: LedgerEntryUncheckedCreateNestedManyWithoutAccountInput
  }

  export type AccountUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    group?: EnumAccountGroupFieldUpdateOperationsInput | $Enums.AccountGroup
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    entries?: LedgerEntryUpdateManyWithoutAccountNestedInput
  }

  export type AccountUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    group?: EnumAccountGroupFieldUpdateOperationsInput | $Enums.AccountGroup
    isSystem?: BoolFieldUpdateOperationsInput | boolean
    entries?: LedgerEntryUncheckedUpdateManyWithoutAccountNestedInput
  }

  export type AccountCreateManyInput = {
    id?: string
    code: string
    name: string
    group: $Enums.AccountGroup
    isSystem?: boolean
  }

  export type AccountUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    group?: EnumAccountGroupFieldUpdateOperationsInput | $Enums.AccountGroup
    isSystem?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AccountUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    group?: EnumAccountGroupFieldUpdateOperationsInput | $Enums.AccountGroup
    isSystem?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LedgerEntryCreateInput = {
    id?: string
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
    account: AccountCreateNestedOneWithoutEntriesInput
    party?: PartyCreateNestedOneWithoutLedgerEntriesInput
    transaction?: TransactionCreateNestedOneWithoutLedgerEntriesInput
  }

  export type LedgerEntryUncheckedCreateInput = {
    id?: string
    accountId: string
    partyId?: string | null
    transactionId?: string | null
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
  }

  export type LedgerEntryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
    account?: AccountUpdateOneRequiredWithoutEntriesNestedInput
    party?: PartyUpdateOneWithoutLedgerEntriesNestedInput
    transaction?: TransactionUpdateOneWithoutLedgerEntriesNestedInput
  }

  export type LedgerEntryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LedgerEntryCreateManyInput = {
    id?: string
    accountId: string
    partyId?: string | null
    transactionId?: string | null
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
  }

  export type LedgerEntryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LedgerEntryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
  }

  export type VendorProductCreateInput = {
    id?: string
    lastPrice?: number | null
    leadTime?: number | null
    vendor: PartyCreateNestedOneWithoutSuppliedProductsInput
    variant: VariantCreateNestedOneWithoutSuppliersInput
  }

  export type VendorProductUncheckedCreateInput = {
    id?: string
    vendorId: string
    variantId: string
    lastPrice?: number | null
    leadTime?: number | null
  }

  export type VendorProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    leadTime?: NullableIntFieldUpdateOperationsInput | number | null
    vendor?: PartyUpdateOneRequiredWithoutSuppliedProductsNestedInput
    variant?: VariantUpdateOneRequiredWithoutSuppliersNestedInput
  }

  export type VendorProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    vendorId?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    lastPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    leadTime?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type VendorProductCreateManyInput = {
    id?: string
    vendorId: string
    variantId: string
    lastPrice?: number | null
    leadTime?: number | null
  }

  export type VendorProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    leadTime?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type VendorProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    vendorId?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    lastPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    leadTime?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type OutletListRelationFilter = {
    every?: OutletWhereInput
    some?: OutletWhereInput
    none?: OutletWhereInput
  }

  export type AuditLogListRelationFilter = {
    every?: AuditLogWhereInput
    some?: AuditLogWhereInput
    none?: AuditLogWhereInput
  }

  export type OutletOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AuditLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AuditLogCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrder
    oldValues?: SortOrder
    newValues?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrder
    createdAt?: SortOrder
  }

  export type AuditLogMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrder
    createdAt?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type StockListRelationFilter = {
    every?: StockWhereInput
    some?: StockWhereInput
    none?: StockWhereInput
  }

  export type StockOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WarehouseCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
  }

  export type WarehouseMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
  }

  export type WarehouseMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type WarehouseListRelationFilter = {
    every?: WarehouseWhereInput
    some?: WarehouseWhereInput
    none?: WarehouseWhereInput
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type WarehouseOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OutletCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    invoicePrefix?: SortOrder
    gstin?: SortOrder
    bankDetails?: SortOrder
    negativeStockPolicy?: SortOrder
  }

  export type OutletMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    invoicePrefix?: SortOrder
    gstin?: SortOrder
    bankDetails?: SortOrder
    negativeStockPolicy?: SortOrder
  }

  export type OutletMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    invoicePrefix?: SortOrder
    gstin?: SortOrder
    bankDetails?: SortOrder
    negativeStockPolicy?: SortOrder
  }

  export type CategoryNullableScalarRelationFilter = {
    is?: CategoryWhereInput | null
    isNot?: CategoryWhereInput | null
  }

  export type CategoryListRelationFilter = {
    every?: CategoryWhereInput
    some?: CategoryWhereInput
    none?: CategoryWhereInput
  }

  export type ProductListRelationFilter = {
    every?: ProductWhereInput
    some?: ProductWhereInput
    none?: ProductWhereInput
  }

  export type CategoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    parentId?: SortOrder
  }

  export type CategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    parentId?: SortOrder
  }

  export type CategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    parentId?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type CategoryScalarRelationFilter = {
    is?: CategoryWhereInput
    isNot?: CategoryWhereInput
  }

  export type VariantListRelationFilter = {
    every?: VariantWhereInput
    some?: VariantWhereInput
    none?: VariantWhereInput
  }

  export type VariantOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    brand?: SortOrder
    hsnCode?: SortOrder
    gstRate?: SortOrder
    baseUnit?: SortOrder
    purchaseUnit?: SortOrder
    salesUnit?: SortOrder
    conversionRatio?: SortOrder
    categoryId?: SortOrder
    isArchived?: SortOrder
  }

  export type ProductAvgOrderByAggregateInput = {
    gstRate?: SortOrder
    conversionRatio?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    brand?: SortOrder
    hsnCode?: SortOrder
    gstRate?: SortOrder
    baseUnit?: SortOrder
    purchaseUnit?: SortOrder
    salesUnit?: SortOrder
    conversionRatio?: SortOrder
    categoryId?: SortOrder
    isArchived?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    brand?: SortOrder
    hsnCode?: SortOrder
    gstRate?: SortOrder
    baseUnit?: SortOrder
    purchaseUnit?: SortOrder
    salesUnit?: SortOrder
    conversionRatio?: SortOrder
    categoryId?: SortOrder
    isArchived?: SortOrder
  }

  export type ProductSumOrderByAggregateInput = {
    gstRate?: SortOrder
    conversionRatio?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type ProductScalarRelationFilter = {
    is?: ProductWhereInput
    isNot?: ProductWhereInput
  }

  export type TransactionItemListRelationFilter = {
    every?: TransactionItemWhereInput
    some?: TransactionItemWhereInput
    none?: TransactionItemWhereInput
  }

  export type VendorProductListRelationFilter = {
    every?: VendorProductWhereInput
    some?: VendorProductWhereInput
    none?: VendorProductWhereInput
  }

  export type TransactionItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VendorProductOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VariantCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    sku?: SortOrder
    specifications?: SortOrder
    purchasePrice?: SortOrder
    sellingPrice?: SortOrder
    pricingMethod?: SortOrder
    markupPercent?: SortOrder
    minStockLevel?: SortOrder
  }

  export type VariantAvgOrderByAggregateInput = {
    purchasePrice?: SortOrder
    sellingPrice?: SortOrder
    markupPercent?: SortOrder
    minStockLevel?: SortOrder
  }

  export type VariantMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    sku?: SortOrder
    purchasePrice?: SortOrder
    sellingPrice?: SortOrder
    pricingMethod?: SortOrder
    markupPercent?: SortOrder
    minStockLevel?: SortOrder
  }

  export type VariantMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    sku?: SortOrder
    purchasePrice?: SortOrder
    sellingPrice?: SortOrder
    pricingMethod?: SortOrder
    markupPercent?: SortOrder
    minStockLevel?: SortOrder
  }

  export type VariantSumOrderByAggregateInput = {
    purchasePrice?: SortOrder
    sellingPrice?: SortOrder
    markupPercent?: SortOrder
    minStockLevel?: SortOrder
  }

  export type VariantScalarRelationFilter = {
    is?: VariantWhereInput
    isNot?: VariantWhereInput
  }

  export type WarehouseNullableScalarRelationFilter = {
    is?: WarehouseWhereInput | null
    isNot?: WarehouseWhereInput | null
  }

  export type OutletNullableScalarRelationFilter = {
    is?: OutletWhereInput | null
    isNot?: OutletWhereInput | null
  }

  export type StockVariantIdWarehouseIdOutletIdCompoundUniqueInput = {
    variantId: string
    warehouseId: string
    outletId: string
  }

  export type StockCountOrderByAggregateInput = {
    id?: SortOrder
    variantId?: SortOrder
    warehouseId?: SortOrder
    outletId?: SortOrder
    quantity?: SortOrder
    inTransitQty?: SortOrder
  }

  export type StockAvgOrderByAggregateInput = {
    quantity?: SortOrder
    inTransitQty?: SortOrder
  }

  export type StockMaxOrderByAggregateInput = {
    id?: SortOrder
    variantId?: SortOrder
    warehouseId?: SortOrder
    outletId?: SortOrder
    quantity?: SortOrder
    inTransitQty?: SortOrder
  }

  export type StockMinOrderByAggregateInput = {
    id?: SortOrder
    variantId?: SortOrder
    warehouseId?: SortOrder
    outletId?: SortOrder
    quantity?: SortOrder
    inTransitQty?: SortOrder
  }

  export type StockSumOrderByAggregateInput = {
    quantity?: SortOrder
    inTransitQty?: SortOrder
  }

  export type EnumPartyTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PartyType | EnumPartyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PartyType[] | ListEnumPartyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PartyType[] | ListEnumPartyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPartyTypeFilter<$PrismaModel> | $Enums.PartyType
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type TransactionListRelationFilter = {
    every?: TransactionWhereInput
    some?: TransactionWhereInput
    none?: TransactionWhereInput
  }

  export type LedgerEntryListRelationFilter = {
    every?: LedgerEntryWhereInput
    some?: LedgerEntryWhereInput
    none?: LedgerEntryWhereInput
  }

  export type TransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type LedgerEntryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PartyCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    name?: SortOrder
    gstin?: SortOrder
    pan?: SortOrder
    address?: SortOrder
    state?: SortOrder
    contactInfo?: SortOrder
    creditPeriod?: SortOrder
    creditLimit?: SortOrder
    openingBalance?: SortOrder
  }

  export type PartyAvgOrderByAggregateInput = {
    creditPeriod?: SortOrder
    creditLimit?: SortOrder
    openingBalance?: SortOrder
  }

  export type PartyMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    name?: SortOrder
    gstin?: SortOrder
    pan?: SortOrder
    address?: SortOrder
    state?: SortOrder
    contactInfo?: SortOrder
    creditPeriod?: SortOrder
    creditLimit?: SortOrder
    openingBalance?: SortOrder
  }

  export type PartyMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    name?: SortOrder
    gstin?: SortOrder
    pan?: SortOrder
    address?: SortOrder
    state?: SortOrder
    contactInfo?: SortOrder
    creditPeriod?: SortOrder
    creditLimit?: SortOrder
    openingBalance?: SortOrder
  }

  export type PartySumOrderByAggregateInput = {
    creditPeriod?: SortOrder
    creditLimit?: SortOrder
    openingBalance?: SortOrder
  }

  export type EnumPartyTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PartyType | EnumPartyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PartyType[] | ListEnumPartyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PartyType[] | ListEnumPartyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPartyTypeWithAggregatesFilter<$PrismaModel> | $Enums.PartyType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPartyTypeFilter<$PrismaModel>
    _max?: NestedEnumPartyTypeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumTxTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TxType | EnumTxTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TxType[] | ListEnumTxTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TxType[] | ListEnumTxTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTxTypeFilter<$PrismaModel> | $Enums.TxType
  }

  export type PartyNullableScalarRelationFilter = {
    is?: PartyWhereInput | null
    isNot?: PartyWhereInput | null
  }

  export type TransactionNullableScalarRelationFilter = {
    is?: TransactionWhereInput | null
    isNot?: TransactionWhereInput | null
  }

  export type TransactionCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    txnNumber?: SortOrder
    date?: SortOrder
    partyId?: SortOrder
    fromLocationId?: SortOrder
    toLocationId?: SortOrder
    totalTaxable?: SortOrder
    totalTax?: SortOrder
    freightCost?: SortOrder
    grandTotal?: SortOrder
    status?: SortOrder
    parentId?: SortOrder
  }

  export type TransactionAvgOrderByAggregateInput = {
    totalTaxable?: SortOrder
    totalTax?: SortOrder
    freightCost?: SortOrder
    grandTotal?: SortOrder
  }

  export type TransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    txnNumber?: SortOrder
    date?: SortOrder
    partyId?: SortOrder
    fromLocationId?: SortOrder
    toLocationId?: SortOrder
    totalTaxable?: SortOrder
    totalTax?: SortOrder
    freightCost?: SortOrder
    grandTotal?: SortOrder
    status?: SortOrder
    parentId?: SortOrder
  }

  export type TransactionMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    txnNumber?: SortOrder
    date?: SortOrder
    partyId?: SortOrder
    fromLocationId?: SortOrder
    toLocationId?: SortOrder
    totalTaxable?: SortOrder
    totalTax?: SortOrder
    freightCost?: SortOrder
    grandTotal?: SortOrder
    status?: SortOrder
    parentId?: SortOrder
  }

  export type TransactionSumOrderByAggregateInput = {
    totalTaxable?: SortOrder
    totalTax?: SortOrder
    freightCost?: SortOrder
    grandTotal?: SortOrder
  }

  export type EnumTxTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TxType | EnumTxTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TxType[] | ListEnumTxTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TxType[] | ListEnumTxTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTxTypeWithAggregatesFilter<$PrismaModel> | $Enums.TxType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTxTypeFilter<$PrismaModel>
    _max?: NestedEnumTxTypeFilter<$PrismaModel>
  }

  export type TransactionScalarRelationFilter = {
    is?: TransactionWhereInput
    isNot?: TransactionWhereInput
  }

  export type TransactionItemCountOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    variantId?: SortOrder
    quantity?: SortOrder
    rate?: SortOrder
    freightFraction?: SortOrder
    taxableValue?: SortOrder
    cgst?: SortOrder
    sgst?: SortOrder
    igst?: SortOrder
  }

  export type TransactionItemAvgOrderByAggregateInput = {
    quantity?: SortOrder
    rate?: SortOrder
    freightFraction?: SortOrder
    taxableValue?: SortOrder
    cgst?: SortOrder
    sgst?: SortOrder
    igst?: SortOrder
  }

  export type TransactionItemMaxOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    variantId?: SortOrder
    quantity?: SortOrder
    rate?: SortOrder
    freightFraction?: SortOrder
    taxableValue?: SortOrder
    cgst?: SortOrder
    sgst?: SortOrder
    igst?: SortOrder
  }

  export type TransactionItemMinOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    variantId?: SortOrder
    quantity?: SortOrder
    rate?: SortOrder
    freightFraction?: SortOrder
    taxableValue?: SortOrder
    cgst?: SortOrder
    sgst?: SortOrder
    igst?: SortOrder
  }

  export type TransactionItemSumOrderByAggregateInput = {
    quantity?: SortOrder
    rate?: SortOrder
    freightFraction?: SortOrder
    taxableValue?: SortOrder
    cgst?: SortOrder
    sgst?: SortOrder
    igst?: SortOrder
  }

  export type EnumAccountGroupFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountGroup | EnumAccountGroupFieldRefInput<$PrismaModel>
    in?: $Enums.AccountGroup[] | ListEnumAccountGroupFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountGroup[] | ListEnumAccountGroupFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountGroupFilter<$PrismaModel> | $Enums.AccountGroup
  }

  export type AccountCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    group?: SortOrder
    isSystem?: SortOrder
  }

  export type AccountMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    group?: SortOrder
    isSystem?: SortOrder
  }

  export type AccountMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    group?: SortOrder
    isSystem?: SortOrder
  }

  export type EnumAccountGroupWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountGroup | EnumAccountGroupFieldRefInput<$PrismaModel>
    in?: $Enums.AccountGroup[] | ListEnumAccountGroupFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountGroup[] | ListEnumAccountGroupFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountGroupWithAggregatesFilter<$PrismaModel> | $Enums.AccountGroup
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAccountGroupFilter<$PrismaModel>
    _max?: NestedEnumAccountGroupFilter<$PrismaModel>
  }

  export type AccountScalarRelationFilter = {
    is?: AccountWhereInput
    isNot?: AccountWhereInput
  }

  export type LedgerEntryCountOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    partyId?: SortOrder
    transactionId?: SortOrder
    date?: SortOrder
    debit?: SortOrder
    credit?: SortOrder
    reference?: SortOrder
    isReconciled?: SortOrder
  }

  export type LedgerEntryAvgOrderByAggregateInput = {
    debit?: SortOrder
    credit?: SortOrder
  }

  export type LedgerEntryMaxOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    partyId?: SortOrder
    transactionId?: SortOrder
    date?: SortOrder
    debit?: SortOrder
    credit?: SortOrder
    reference?: SortOrder
    isReconciled?: SortOrder
  }

  export type LedgerEntryMinOrderByAggregateInput = {
    id?: SortOrder
    accountId?: SortOrder
    partyId?: SortOrder
    transactionId?: SortOrder
    date?: SortOrder
    debit?: SortOrder
    credit?: SortOrder
    reference?: SortOrder
    isReconciled?: SortOrder
  }

  export type LedgerEntrySumOrderByAggregateInput = {
    debit?: SortOrder
    credit?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type PartyScalarRelationFilter = {
    is?: PartyWhereInput
    isNot?: PartyWhereInput
  }

  export type VendorProductVendorIdVariantIdCompoundUniqueInput = {
    vendorId: string
    variantId: string
  }

  export type VendorProductCountOrderByAggregateInput = {
    id?: SortOrder
    vendorId?: SortOrder
    variantId?: SortOrder
    lastPrice?: SortOrder
    leadTime?: SortOrder
  }

  export type VendorProductAvgOrderByAggregateInput = {
    lastPrice?: SortOrder
    leadTime?: SortOrder
  }

  export type VendorProductMaxOrderByAggregateInput = {
    id?: SortOrder
    vendorId?: SortOrder
    variantId?: SortOrder
    lastPrice?: SortOrder
    leadTime?: SortOrder
  }

  export type VendorProductMinOrderByAggregateInput = {
    id?: SortOrder
    vendorId?: SortOrder
    variantId?: SortOrder
    lastPrice?: SortOrder
    leadTime?: SortOrder
  }

  export type VendorProductSumOrderByAggregateInput = {
    lastPrice?: SortOrder
    leadTime?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type OutletCreateNestedManyWithoutUsersInput = {
    create?: XOR<OutletCreateWithoutUsersInput, OutletUncheckedCreateWithoutUsersInput> | OutletCreateWithoutUsersInput[] | OutletUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: OutletCreateOrConnectWithoutUsersInput | OutletCreateOrConnectWithoutUsersInput[]
    connect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
  }

  export type AuditLogCreateNestedManyWithoutUserInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type OutletUncheckedCreateNestedManyWithoutUsersInput = {
    create?: XOR<OutletCreateWithoutUsersInput, OutletUncheckedCreateWithoutUsersInput> | OutletCreateWithoutUsersInput[] | OutletUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: OutletCreateOrConnectWithoutUsersInput | OutletCreateOrConnectWithoutUsersInput[]
    connect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
  }

  export type AuditLogUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type OutletUpdateManyWithoutUsersNestedInput = {
    create?: XOR<OutletCreateWithoutUsersInput, OutletUncheckedCreateWithoutUsersInput> | OutletCreateWithoutUsersInput[] | OutletUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: OutletCreateOrConnectWithoutUsersInput | OutletCreateOrConnectWithoutUsersInput[]
    upsert?: OutletUpsertWithWhereUniqueWithoutUsersInput | OutletUpsertWithWhereUniqueWithoutUsersInput[]
    set?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    disconnect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    delete?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    connect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    update?: OutletUpdateWithWhereUniqueWithoutUsersInput | OutletUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: OutletUpdateManyWithWhereWithoutUsersInput | OutletUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: OutletScalarWhereInput | OutletScalarWhereInput[]
  }

  export type AuditLogUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutUserInput | AuditLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutUserInput | AuditLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutUserInput | AuditLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type OutletUncheckedUpdateManyWithoutUsersNestedInput = {
    create?: XOR<OutletCreateWithoutUsersInput, OutletUncheckedCreateWithoutUsersInput> | OutletCreateWithoutUsersInput[] | OutletUncheckedCreateWithoutUsersInput[]
    connectOrCreate?: OutletCreateOrConnectWithoutUsersInput | OutletCreateOrConnectWithoutUsersInput[]
    upsert?: OutletUpsertWithWhereUniqueWithoutUsersInput | OutletUpsertWithWhereUniqueWithoutUsersInput[]
    set?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    disconnect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    delete?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    connect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    update?: OutletUpdateWithWhereUniqueWithoutUsersInput | OutletUpdateWithWhereUniqueWithoutUsersInput[]
    updateMany?: OutletUpdateManyWithWhereWithoutUsersInput | OutletUpdateManyWithWhereWithoutUsersInput[]
    deleteMany?: OutletScalarWhereInput | OutletScalarWhereInput[]
  }

  export type AuditLogUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput> | AuditLogCreateWithoutUserInput[] | AuditLogUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuditLogCreateOrConnectWithoutUserInput | AuditLogCreateOrConnectWithoutUserInput[]
    upsert?: AuditLogUpsertWithWhereUniqueWithoutUserInput | AuditLogUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuditLogCreateManyUserInputEnvelope
    set?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    disconnect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    delete?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    connect?: AuditLogWhereUniqueInput | AuditLogWhereUniqueInput[]
    update?: AuditLogUpdateWithWhereUniqueWithoutUserInput | AuditLogUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuditLogUpdateManyWithWhereWithoutUserInput | AuditLogUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutActionsInput = {
    create?: XOR<UserCreateWithoutActionsInput, UserUncheckedCreateWithoutActionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutActionsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutActionsNestedInput = {
    create?: XOR<UserCreateWithoutActionsInput, UserUncheckedCreateWithoutActionsInput>
    connectOrCreate?: UserCreateOrConnectWithoutActionsInput
    upsert?: UserUpsertWithoutActionsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutActionsInput, UserUpdateWithoutActionsInput>, UserUncheckedUpdateWithoutActionsInput>
  }

  export type OutletCreateNestedManyWithoutWarehousesInput = {
    create?: XOR<OutletCreateWithoutWarehousesInput, OutletUncheckedCreateWithoutWarehousesInput> | OutletCreateWithoutWarehousesInput[] | OutletUncheckedCreateWithoutWarehousesInput[]
    connectOrCreate?: OutletCreateOrConnectWithoutWarehousesInput | OutletCreateOrConnectWithoutWarehousesInput[]
    connect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
  }

  export type StockCreateNestedManyWithoutWarehouseInput = {
    create?: XOR<StockCreateWithoutWarehouseInput, StockUncheckedCreateWithoutWarehouseInput> | StockCreateWithoutWarehouseInput[] | StockUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: StockCreateOrConnectWithoutWarehouseInput | StockCreateOrConnectWithoutWarehouseInput[]
    createMany?: StockCreateManyWarehouseInputEnvelope
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
  }

  export type OutletUncheckedCreateNestedManyWithoutWarehousesInput = {
    create?: XOR<OutletCreateWithoutWarehousesInput, OutletUncheckedCreateWithoutWarehousesInput> | OutletCreateWithoutWarehousesInput[] | OutletUncheckedCreateWithoutWarehousesInput[]
    connectOrCreate?: OutletCreateOrConnectWithoutWarehousesInput | OutletCreateOrConnectWithoutWarehousesInput[]
    connect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
  }

  export type StockUncheckedCreateNestedManyWithoutWarehouseInput = {
    create?: XOR<StockCreateWithoutWarehouseInput, StockUncheckedCreateWithoutWarehouseInput> | StockCreateWithoutWarehouseInput[] | StockUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: StockCreateOrConnectWithoutWarehouseInput | StockCreateOrConnectWithoutWarehouseInput[]
    createMany?: StockCreateManyWarehouseInputEnvelope
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type OutletUpdateManyWithoutWarehousesNestedInput = {
    create?: XOR<OutletCreateWithoutWarehousesInput, OutletUncheckedCreateWithoutWarehousesInput> | OutletCreateWithoutWarehousesInput[] | OutletUncheckedCreateWithoutWarehousesInput[]
    connectOrCreate?: OutletCreateOrConnectWithoutWarehousesInput | OutletCreateOrConnectWithoutWarehousesInput[]
    upsert?: OutletUpsertWithWhereUniqueWithoutWarehousesInput | OutletUpsertWithWhereUniqueWithoutWarehousesInput[]
    set?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    disconnect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    delete?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    connect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    update?: OutletUpdateWithWhereUniqueWithoutWarehousesInput | OutletUpdateWithWhereUniqueWithoutWarehousesInput[]
    updateMany?: OutletUpdateManyWithWhereWithoutWarehousesInput | OutletUpdateManyWithWhereWithoutWarehousesInput[]
    deleteMany?: OutletScalarWhereInput | OutletScalarWhereInput[]
  }

  export type StockUpdateManyWithoutWarehouseNestedInput = {
    create?: XOR<StockCreateWithoutWarehouseInput, StockUncheckedCreateWithoutWarehouseInput> | StockCreateWithoutWarehouseInput[] | StockUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: StockCreateOrConnectWithoutWarehouseInput | StockCreateOrConnectWithoutWarehouseInput[]
    upsert?: StockUpsertWithWhereUniqueWithoutWarehouseInput | StockUpsertWithWhereUniqueWithoutWarehouseInput[]
    createMany?: StockCreateManyWarehouseInputEnvelope
    set?: StockWhereUniqueInput | StockWhereUniqueInput[]
    disconnect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    delete?: StockWhereUniqueInput | StockWhereUniqueInput[]
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    update?: StockUpdateWithWhereUniqueWithoutWarehouseInput | StockUpdateWithWhereUniqueWithoutWarehouseInput[]
    updateMany?: StockUpdateManyWithWhereWithoutWarehouseInput | StockUpdateManyWithWhereWithoutWarehouseInput[]
    deleteMany?: StockScalarWhereInput | StockScalarWhereInput[]
  }

  export type OutletUncheckedUpdateManyWithoutWarehousesNestedInput = {
    create?: XOR<OutletCreateWithoutWarehousesInput, OutletUncheckedCreateWithoutWarehousesInput> | OutletCreateWithoutWarehousesInput[] | OutletUncheckedCreateWithoutWarehousesInput[]
    connectOrCreate?: OutletCreateOrConnectWithoutWarehousesInput | OutletCreateOrConnectWithoutWarehousesInput[]
    upsert?: OutletUpsertWithWhereUniqueWithoutWarehousesInput | OutletUpsertWithWhereUniqueWithoutWarehousesInput[]
    set?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    disconnect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    delete?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    connect?: OutletWhereUniqueInput | OutletWhereUniqueInput[]
    update?: OutletUpdateWithWhereUniqueWithoutWarehousesInput | OutletUpdateWithWhereUniqueWithoutWarehousesInput[]
    updateMany?: OutletUpdateManyWithWhereWithoutWarehousesInput | OutletUpdateManyWithWhereWithoutWarehousesInput[]
    deleteMany?: OutletScalarWhereInput | OutletScalarWhereInput[]
  }

  export type StockUncheckedUpdateManyWithoutWarehouseNestedInput = {
    create?: XOR<StockCreateWithoutWarehouseInput, StockUncheckedCreateWithoutWarehouseInput> | StockCreateWithoutWarehouseInput[] | StockUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: StockCreateOrConnectWithoutWarehouseInput | StockCreateOrConnectWithoutWarehouseInput[]
    upsert?: StockUpsertWithWhereUniqueWithoutWarehouseInput | StockUpsertWithWhereUniqueWithoutWarehouseInput[]
    createMany?: StockCreateManyWarehouseInputEnvelope
    set?: StockWhereUniqueInput | StockWhereUniqueInput[]
    disconnect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    delete?: StockWhereUniqueInput | StockWhereUniqueInput[]
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    update?: StockUpdateWithWhereUniqueWithoutWarehouseInput | StockUpdateWithWhereUniqueWithoutWarehouseInput[]
    updateMany?: StockUpdateManyWithWhereWithoutWarehouseInput | StockUpdateManyWithWhereWithoutWarehouseInput[]
    deleteMany?: StockScalarWhereInput | StockScalarWhereInput[]
  }

  export type WarehouseCreateNestedManyWithoutOutletsInput = {
    create?: XOR<WarehouseCreateWithoutOutletsInput, WarehouseUncheckedCreateWithoutOutletsInput> | WarehouseCreateWithoutOutletsInput[] | WarehouseUncheckedCreateWithoutOutletsInput[]
    connectOrCreate?: WarehouseCreateOrConnectWithoutOutletsInput | WarehouseCreateOrConnectWithoutOutletsInput[]
    connect?: WarehouseWhereUniqueInput | WarehouseWhereUniqueInput[]
  }

  export type UserCreateNestedManyWithoutOutletsInput = {
    create?: XOR<UserCreateWithoutOutletsInput, UserUncheckedCreateWithoutOutletsInput> | UserCreateWithoutOutletsInput[] | UserUncheckedCreateWithoutOutletsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOutletsInput | UserCreateOrConnectWithoutOutletsInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type StockCreateNestedManyWithoutOutletInput = {
    create?: XOR<StockCreateWithoutOutletInput, StockUncheckedCreateWithoutOutletInput> | StockCreateWithoutOutletInput[] | StockUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: StockCreateOrConnectWithoutOutletInput | StockCreateOrConnectWithoutOutletInput[]
    createMany?: StockCreateManyOutletInputEnvelope
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
  }

  export type WarehouseUncheckedCreateNestedManyWithoutOutletsInput = {
    create?: XOR<WarehouseCreateWithoutOutletsInput, WarehouseUncheckedCreateWithoutOutletsInput> | WarehouseCreateWithoutOutletsInput[] | WarehouseUncheckedCreateWithoutOutletsInput[]
    connectOrCreate?: WarehouseCreateOrConnectWithoutOutletsInput | WarehouseCreateOrConnectWithoutOutletsInput[]
    connect?: WarehouseWhereUniqueInput | WarehouseWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutOutletsInput = {
    create?: XOR<UserCreateWithoutOutletsInput, UserUncheckedCreateWithoutOutletsInput> | UserCreateWithoutOutletsInput[] | UserUncheckedCreateWithoutOutletsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOutletsInput | UserCreateOrConnectWithoutOutletsInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type StockUncheckedCreateNestedManyWithoutOutletInput = {
    create?: XOR<StockCreateWithoutOutletInput, StockUncheckedCreateWithoutOutletInput> | StockCreateWithoutOutletInput[] | StockUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: StockCreateOrConnectWithoutOutletInput | StockCreateOrConnectWithoutOutletInput[]
    createMany?: StockCreateManyOutletInputEnvelope
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
  }

  export type WarehouseUpdateManyWithoutOutletsNestedInput = {
    create?: XOR<WarehouseCreateWithoutOutletsInput, WarehouseUncheckedCreateWithoutOutletsInput> | WarehouseCreateWithoutOutletsInput[] | WarehouseUncheckedCreateWithoutOutletsInput[]
    connectOrCreate?: WarehouseCreateOrConnectWithoutOutletsInput | WarehouseCreateOrConnectWithoutOutletsInput[]
    upsert?: WarehouseUpsertWithWhereUniqueWithoutOutletsInput | WarehouseUpsertWithWhereUniqueWithoutOutletsInput[]
    set?: WarehouseWhereUniqueInput | WarehouseWhereUniqueInput[]
    disconnect?: WarehouseWhereUniqueInput | WarehouseWhereUniqueInput[]
    delete?: WarehouseWhereUniqueInput | WarehouseWhereUniqueInput[]
    connect?: WarehouseWhereUniqueInput | WarehouseWhereUniqueInput[]
    update?: WarehouseUpdateWithWhereUniqueWithoutOutletsInput | WarehouseUpdateWithWhereUniqueWithoutOutletsInput[]
    updateMany?: WarehouseUpdateManyWithWhereWithoutOutletsInput | WarehouseUpdateManyWithWhereWithoutOutletsInput[]
    deleteMany?: WarehouseScalarWhereInput | WarehouseScalarWhereInput[]
  }

  export type UserUpdateManyWithoutOutletsNestedInput = {
    create?: XOR<UserCreateWithoutOutletsInput, UserUncheckedCreateWithoutOutletsInput> | UserCreateWithoutOutletsInput[] | UserUncheckedCreateWithoutOutletsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOutletsInput | UserCreateOrConnectWithoutOutletsInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutOutletsInput | UserUpsertWithWhereUniqueWithoutOutletsInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutOutletsInput | UserUpdateWithWhereUniqueWithoutOutletsInput[]
    updateMany?: UserUpdateManyWithWhereWithoutOutletsInput | UserUpdateManyWithWhereWithoutOutletsInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type StockUpdateManyWithoutOutletNestedInput = {
    create?: XOR<StockCreateWithoutOutletInput, StockUncheckedCreateWithoutOutletInput> | StockCreateWithoutOutletInput[] | StockUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: StockCreateOrConnectWithoutOutletInput | StockCreateOrConnectWithoutOutletInput[]
    upsert?: StockUpsertWithWhereUniqueWithoutOutletInput | StockUpsertWithWhereUniqueWithoutOutletInput[]
    createMany?: StockCreateManyOutletInputEnvelope
    set?: StockWhereUniqueInput | StockWhereUniqueInput[]
    disconnect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    delete?: StockWhereUniqueInput | StockWhereUniqueInput[]
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    update?: StockUpdateWithWhereUniqueWithoutOutletInput | StockUpdateWithWhereUniqueWithoutOutletInput[]
    updateMany?: StockUpdateManyWithWhereWithoutOutletInput | StockUpdateManyWithWhereWithoutOutletInput[]
    deleteMany?: StockScalarWhereInput | StockScalarWhereInput[]
  }

  export type WarehouseUncheckedUpdateManyWithoutOutletsNestedInput = {
    create?: XOR<WarehouseCreateWithoutOutletsInput, WarehouseUncheckedCreateWithoutOutletsInput> | WarehouseCreateWithoutOutletsInput[] | WarehouseUncheckedCreateWithoutOutletsInput[]
    connectOrCreate?: WarehouseCreateOrConnectWithoutOutletsInput | WarehouseCreateOrConnectWithoutOutletsInput[]
    upsert?: WarehouseUpsertWithWhereUniqueWithoutOutletsInput | WarehouseUpsertWithWhereUniqueWithoutOutletsInput[]
    set?: WarehouseWhereUniqueInput | WarehouseWhereUniqueInput[]
    disconnect?: WarehouseWhereUniqueInput | WarehouseWhereUniqueInput[]
    delete?: WarehouseWhereUniqueInput | WarehouseWhereUniqueInput[]
    connect?: WarehouseWhereUniqueInput | WarehouseWhereUniqueInput[]
    update?: WarehouseUpdateWithWhereUniqueWithoutOutletsInput | WarehouseUpdateWithWhereUniqueWithoutOutletsInput[]
    updateMany?: WarehouseUpdateManyWithWhereWithoutOutletsInput | WarehouseUpdateManyWithWhereWithoutOutletsInput[]
    deleteMany?: WarehouseScalarWhereInput | WarehouseScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutOutletsNestedInput = {
    create?: XOR<UserCreateWithoutOutletsInput, UserUncheckedCreateWithoutOutletsInput> | UserCreateWithoutOutletsInput[] | UserUncheckedCreateWithoutOutletsInput[]
    connectOrCreate?: UserCreateOrConnectWithoutOutletsInput | UserCreateOrConnectWithoutOutletsInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutOutletsInput | UserUpsertWithWhereUniqueWithoutOutletsInput[]
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutOutletsInput | UserUpdateWithWhereUniqueWithoutOutletsInput[]
    updateMany?: UserUpdateManyWithWhereWithoutOutletsInput | UserUpdateManyWithWhereWithoutOutletsInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type StockUncheckedUpdateManyWithoutOutletNestedInput = {
    create?: XOR<StockCreateWithoutOutletInput, StockUncheckedCreateWithoutOutletInput> | StockCreateWithoutOutletInput[] | StockUncheckedCreateWithoutOutletInput[]
    connectOrCreate?: StockCreateOrConnectWithoutOutletInput | StockCreateOrConnectWithoutOutletInput[]
    upsert?: StockUpsertWithWhereUniqueWithoutOutletInput | StockUpsertWithWhereUniqueWithoutOutletInput[]
    createMany?: StockCreateManyOutletInputEnvelope
    set?: StockWhereUniqueInput | StockWhereUniqueInput[]
    disconnect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    delete?: StockWhereUniqueInput | StockWhereUniqueInput[]
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    update?: StockUpdateWithWhereUniqueWithoutOutletInput | StockUpdateWithWhereUniqueWithoutOutletInput[]
    updateMany?: StockUpdateManyWithWhereWithoutOutletInput | StockUpdateManyWithWhereWithoutOutletInput[]
    deleteMany?: StockScalarWhereInput | StockScalarWhereInput[]
  }

  export type CategoryCreateNestedOneWithoutChildrenInput = {
    create?: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutChildrenInput
    connect?: CategoryWhereUniqueInput
  }

  export type CategoryCreateNestedManyWithoutParentInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
  }

  export type ProductCreateNestedManyWithoutCategoryInput = {
    create?: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput> | ProductCreateWithoutCategoryInput[] | ProductUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCategoryInput | ProductCreateOrConnectWithoutCategoryInput[]
    createMany?: ProductCreateManyCategoryInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type CategoryUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
  }

  export type ProductUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput> | ProductCreateWithoutCategoryInput[] | ProductUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCategoryInput | ProductCreateOrConnectWithoutCategoryInput[]
    createMany?: ProductCreateManyCategoryInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type CategoryUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutChildrenInput
    upsert?: CategoryUpsertWithoutChildrenInput
    disconnect?: CategoryWhereInput | boolean
    delete?: CategoryWhereInput | boolean
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutChildrenInput, CategoryUpdateWithoutChildrenInput>, CategoryUncheckedUpdateWithoutChildrenInput>
  }

  export type CategoryUpdateManyWithoutParentNestedInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    upsert?: CategoryUpsertWithWhereUniqueWithoutParentInput | CategoryUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    set?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    disconnect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    delete?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    update?: CategoryUpdateWithWhereUniqueWithoutParentInput | CategoryUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: CategoryUpdateManyWithWhereWithoutParentInput | CategoryUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
  }

  export type ProductUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput> | ProductCreateWithoutCategoryInput[] | ProductUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCategoryInput | ProductCreateOrConnectWithoutCategoryInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCategoryInput | ProductUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: ProductCreateManyCategoryInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCategoryInput | ProductUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCategoryInput | ProductUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type CategoryUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput> | CategoryCreateWithoutParentInput[] | CategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: CategoryCreateOrConnectWithoutParentInput | CategoryCreateOrConnectWithoutParentInput[]
    upsert?: CategoryUpsertWithWhereUniqueWithoutParentInput | CategoryUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: CategoryCreateManyParentInputEnvelope
    set?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    disconnect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    delete?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    connect?: CategoryWhereUniqueInput | CategoryWhereUniqueInput[]
    update?: CategoryUpdateWithWhereUniqueWithoutParentInput | CategoryUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: CategoryUpdateManyWithWhereWithoutParentInput | CategoryUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
  }

  export type ProductUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput> | ProductCreateWithoutCategoryInput[] | ProductUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutCategoryInput | ProductCreateOrConnectWithoutCategoryInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutCategoryInput | ProductUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: ProductCreateManyCategoryInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutCategoryInput | ProductUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutCategoryInput | ProductUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type CategoryCreateNestedOneWithoutProductsInput = {
    create?: XOR<CategoryCreateWithoutProductsInput, CategoryUncheckedCreateWithoutProductsInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutProductsInput
    connect?: CategoryWhereUniqueInput
  }

  export type VariantCreateNestedManyWithoutProductInput = {
    create?: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput> | VariantCreateWithoutProductInput[] | VariantUncheckedCreateWithoutProductInput[]
    connectOrCreate?: VariantCreateOrConnectWithoutProductInput | VariantCreateOrConnectWithoutProductInput[]
    createMany?: VariantCreateManyProductInputEnvelope
    connect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
  }

  export type VariantUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput> | VariantCreateWithoutProductInput[] | VariantUncheckedCreateWithoutProductInput[]
    connectOrCreate?: VariantCreateOrConnectWithoutProductInput | VariantCreateOrConnectWithoutProductInput[]
    createMany?: VariantCreateManyProductInputEnvelope
    connect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type CategoryUpdateOneRequiredWithoutProductsNestedInput = {
    create?: XOR<CategoryCreateWithoutProductsInput, CategoryUncheckedCreateWithoutProductsInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutProductsInput
    upsert?: CategoryUpsertWithoutProductsInput
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutProductsInput, CategoryUpdateWithoutProductsInput>, CategoryUncheckedUpdateWithoutProductsInput>
  }

  export type VariantUpdateManyWithoutProductNestedInput = {
    create?: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput> | VariantCreateWithoutProductInput[] | VariantUncheckedCreateWithoutProductInput[]
    connectOrCreate?: VariantCreateOrConnectWithoutProductInput | VariantCreateOrConnectWithoutProductInput[]
    upsert?: VariantUpsertWithWhereUniqueWithoutProductInput | VariantUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: VariantCreateManyProductInputEnvelope
    set?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    disconnect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    delete?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    connect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    update?: VariantUpdateWithWhereUniqueWithoutProductInput | VariantUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: VariantUpdateManyWithWhereWithoutProductInput | VariantUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: VariantScalarWhereInput | VariantScalarWhereInput[]
  }

  export type VariantUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput> | VariantCreateWithoutProductInput[] | VariantUncheckedCreateWithoutProductInput[]
    connectOrCreate?: VariantCreateOrConnectWithoutProductInput | VariantCreateOrConnectWithoutProductInput[]
    upsert?: VariantUpsertWithWhereUniqueWithoutProductInput | VariantUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: VariantCreateManyProductInputEnvelope
    set?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    disconnect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    delete?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    connect?: VariantWhereUniqueInput | VariantWhereUniqueInput[]
    update?: VariantUpdateWithWhereUniqueWithoutProductInput | VariantUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: VariantUpdateManyWithWhereWithoutProductInput | VariantUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: VariantScalarWhereInput | VariantScalarWhereInput[]
  }

  export type ProductCreateNestedOneWithoutVariantsInput = {
    create?: XOR<ProductCreateWithoutVariantsInput, ProductUncheckedCreateWithoutVariantsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutVariantsInput
    connect?: ProductWhereUniqueInput
  }

  export type StockCreateNestedManyWithoutVariantInput = {
    create?: XOR<StockCreateWithoutVariantInput, StockUncheckedCreateWithoutVariantInput> | StockCreateWithoutVariantInput[] | StockUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: StockCreateOrConnectWithoutVariantInput | StockCreateOrConnectWithoutVariantInput[]
    createMany?: StockCreateManyVariantInputEnvelope
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
  }

  export type TransactionItemCreateNestedManyWithoutVariantInput = {
    create?: XOR<TransactionItemCreateWithoutVariantInput, TransactionItemUncheckedCreateWithoutVariantInput> | TransactionItemCreateWithoutVariantInput[] | TransactionItemUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutVariantInput | TransactionItemCreateOrConnectWithoutVariantInput[]
    createMany?: TransactionItemCreateManyVariantInputEnvelope
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
  }

  export type VendorProductCreateNestedManyWithoutVariantInput = {
    create?: XOR<VendorProductCreateWithoutVariantInput, VendorProductUncheckedCreateWithoutVariantInput> | VendorProductCreateWithoutVariantInput[] | VendorProductUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: VendorProductCreateOrConnectWithoutVariantInput | VendorProductCreateOrConnectWithoutVariantInput[]
    createMany?: VendorProductCreateManyVariantInputEnvelope
    connect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
  }

  export type StockUncheckedCreateNestedManyWithoutVariantInput = {
    create?: XOR<StockCreateWithoutVariantInput, StockUncheckedCreateWithoutVariantInput> | StockCreateWithoutVariantInput[] | StockUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: StockCreateOrConnectWithoutVariantInput | StockCreateOrConnectWithoutVariantInput[]
    createMany?: StockCreateManyVariantInputEnvelope
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
  }

  export type TransactionItemUncheckedCreateNestedManyWithoutVariantInput = {
    create?: XOR<TransactionItemCreateWithoutVariantInput, TransactionItemUncheckedCreateWithoutVariantInput> | TransactionItemCreateWithoutVariantInput[] | TransactionItemUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutVariantInput | TransactionItemCreateOrConnectWithoutVariantInput[]
    createMany?: TransactionItemCreateManyVariantInputEnvelope
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
  }

  export type VendorProductUncheckedCreateNestedManyWithoutVariantInput = {
    create?: XOR<VendorProductCreateWithoutVariantInput, VendorProductUncheckedCreateWithoutVariantInput> | VendorProductCreateWithoutVariantInput[] | VendorProductUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: VendorProductCreateOrConnectWithoutVariantInput | VendorProductCreateOrConnectWithoutVariantInput[]
    createMany?: VendorProductCreateManyVariantInputEnvelope
    connect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
  }

  export type ProductUpdateOneRequiredWithoutVariantsNestedInput = {
    create?: XOR<ProductCreateWithoutVariantsInput, ProductUncheckedCreateWithoutVariantsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutVariantsInput
    upsert?: ProductUpsertWithoutVariantsInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutVariantsInput, ProductUpdateWithoutVariantsInput>, ProductUncheckedUpdateWithoutVariantsInput>
  }

  export type StockUpdateManyWithoutVariantNestedInput = {
    create?: XOR<StockCreateWithoutVariantInput, StockUncheckedCreateWithoutVariantInput> | StockCreateWithoutVariantInput[] | StockUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: StockCreateOrConnectWithoutVariantInput | StockCreateOrConnectWithoutVariantInput[]
    upsert?: StockUpsertWithWhereUniqueWithoutVariantInput | StockUpsertWithWhereUniqueWithoutVariantInput[]
    createMany?: StockCreateManyVariantInputEnvelope
    set?: StockWhereUniqueInput | StockWhereUniqueInput[]
    disconnect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    delete?: StockWhereUniqueInput | StockWhereUniqueInput[]
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    update?: StockUpdateWithWhereUniqueWithoutVariantInput | StockUpdateWithWhereUniqueWithoutVariantInput[]
    updateMany?: StockUpdateManyWithWhereWithoutVariantInput | StockUpdateManyWithWhereWithoutVariantInput[]
    deleteMany?: StockScalarWhereInput | StockScalarWhereInput[]
  }

  export type TransactionItemUpdateManyWithoutVariantNestedInput = {
    create?: XOR<TransactionItemCreateWithoutVariantInput, TransactionItemUncheckedCreateWithoutVariantInput> | TransactionItemCreateWithoutVariantInput[] | TransactionItemUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutVariantInput | TransactionItemCreateOrConnectWithoutVariantInput[]
    upsert?: TransactionItemUpsertWithWhereUniqueWithoutVariantInput | TransactionItemUpsertWithWhereUniqueWithoutVariantInput[]
    createMany?: TransactionItemCreateManyVariantInputEnvelope
    set?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    disconnect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    delete?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    update?: TransactionItemUpdateWithWhereUniqueWithoutVariantInput | TransactionItemUpdateWithWhereUniqueWithoutVariantInput[]
    updateMany?: TransactionItemUpdateManyWithWhereWithoutVariantInput | TransactionItemUpdateManyWithWhereWithoutVariantInput[]
    deleteMany?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
  }

  export type VendorProductUpdateManyWithoutVariantNestedInput = {
    create?: XOR<VendorProductCreateWithoutVariantInput, VendorProductUncheckedCreateWithoutVariantInput> | VendorProductCreateWithoutVariantInput[] | VendorProductUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: VendorProductCreateOrConnectWithoutVariantInput | VendorProductCreateOrConnectWithoutVariantInput[]
    upsert?: VendorProductUpsertWithWhereUniqueWithoutVariantInput | VendorProductUpsertWithWhereUniqueWithoutVariantInput[]
    createMany?: VendorProductCreateManyVariantInputEnvelope
    set?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    disconnect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    delete?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    connect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    update?: VendorProductUpdateWithWhereUniqueWithoutVariantInput | VendorProductUpdateWithWhereUniqueWithoutVariantInput[]
    updateMany?: VendorProductUpdateManyWithWhereWithoutVariantInput | VendorProductUpdateManyWithWhereWithoutVariantInput[]
    deleteMany?: VendorProductScalarWhereInput | VendorProductScalarWhereInput[]
  }

  export type StockUncheckedUpdateManyWithoutVariantNestedInput = {
    create?: XOR<StockCreateWithoutVariantInput, StockUncheckedCreateWithoutVariantInput> | StockCreateWithoutVariantInput[] | StockUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: StockCreateOrConnectWithoutVariantInput | StockCreateOrConnectWithoutVariantInput[]
    upsert?: StockUpsertWithWhereUniqueWithoutVariantInput | StockUpsertWithWhereUniqueWithoutVariantInput[]
    createMany?: StockCreateManyVariantInputEnvelope
    set?: StockWhereUniqueInput | StockWhereUniqueInput[]
    disconnect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    delete?: StockWhereUniqueInput | StockWhereUniqueInput[]
    connect?: StockWhereUniqueInput | StockWhereUniqueInput[]
    update?: StockUpdateWithWhereUniqueWithoutVariantInput | StockUpdateWithWhereUniqueWithoutVariantInput[]
    updateMany?: StockUpdateManyWithWhereWithoutVariantInput | StockUpdateManyWithWhereWithoutVariantInput[]
    deleteMany?: StockScalarWhereInput | StockScalarWhereInput[]
  }

  export type TransactionItemUncheckedUpdateManyWithoutVariantNestedInput = {
    create?: XOR<TransactionItemCreateWithoutVariantInput, TransactionItemUncheckedCreateWithoutVariantInput> | TransactionItemCreateWithoutVariantInput[] | TransactionItemUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutVariantInput | TransactionItemCreateOrConnectWithoutVariantInput[]
    upsert?: TransactionItemUpsertWithWhereUniqueWithoutVariantInput | TransactionItemUpsertWithWhereUniqueWithoutVariantInput[]
    createMany?: TransactionItemCreateManyVariantInputEnvelope
    set?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    disconnect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    delete?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    update?: TransactionItemUpdateWithWhereUniqueWithoutVariantInput | TransactionItemUpdateWithWhereUniqueWithoutVariantInput[]
    updateMany?: TransactionItemUpdateManyWithWhereWithoutVariantInput | TransactionItemUpdateManyWithWhereWithoutVariantInput[]
    deleteMany?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
  }

  export type VendorProductUncheckedUpdateManyWithoutVariantNestedInput = {
    create?: XOR<VendorProductCreateWithoutVariantInput, VendorProductUncheckedCreateWithoutVariantInput> | VendorProductCreateWithoutVariantInput[] | VendorProductUncheckedCreateWithoutVariantInput[]
    connectOrCreate?: VendorProductCreateOrConnectWithoutVariantInput | VendorProductCreateOrConnectWithoutVariantInput[]
    upsert?: VendorProductUpsertWithWhereUniqueWithoutVariantInput | VendorProductUpsertWithWhereUniqueWithoutVariantInput[]
    createMany?: VendorProductCreateManyVariantInputEnvelope
    set?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    disconnect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    delete?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    connect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    update?: VendorProductUpdateWithWhereUniqueWithoutVariantInput | VendorProductUpdateWithWhereUniqueWithoutVariantInput[]
    updateMany?: VendorProductUpdateManyWithWhereWithoutVariantInput | VendorProductUpdateManyWithWhereWithoutVariantInput[]
    deleteMany?: VendorProductScalarWhereInput | VendorProductScalarWhereInput[]
  }

  export type VariantCreateNestedOneWithoutStocksInput = {
    create?: XOR<VariantCreateWithoutStocksInput, VariantUncheckedCreateWithoutStocksInput>
    connectOrCreate?: VariantCreateOrConnectWithoutStocksInput
    connect?: VariantWhereUniqueInput
  }

  export type WarehouseCreateNestedOneWithoutStocksInput = {
    create?: XOR<WarehouseCreateWithoutStocksInput, WarehouseUncheckedCreateWithoutStocksInput>
    connectOrCreate?: WarehouseCreateOrConnectWithoutStocksInput
    connect?: WarehouseWhereUniqueInput
  }

  export type OutletCreateNestedOneWithoutStocksInput = {
    create?: XOR<OutletCreateWithoutStocksInput, OutletUncheckedCreateWithoutStocksInput>
    connectOrCreate?: OutletCreateOrConnectWithoutStocksInput
    connect?: OutletWhereUniqueInput
  }

  export type VariantUpdateOneRequiredWithoutStocksNestedInput = {
    create?: XOR<VariantCreateWithoutStocksInput, VariantUncheckedCreateWithoutStocksInput>
    connectOrCreate?: VariantCreateOrConnectWithoutStocksInput
    upsert?: VariantUpsertWithoutStocksInput
    connect?: VariantWhereUniqueInput
    update?: XOR<XOR<VariantUpdateToOneWithWhereWithoutStocksInput, VariantUpdateWithoutStocksInput>, VariantUncheckedUpdateWithoutStocksInput>
  }

  export type WarehouseUpdateOneWithoutStocksNestedInput = {
    create?: XOR<WarehouseCreateWithoutStocksInput, WarehouseUncheckedCreateWithoutStocksInput>
    connectOrCreate?: WarehouseCreateOrConnectWithoutStocksInput
    upsert?: WarehouseUpsertWithoutStocksInput
    disconnect?: WarehouseWhereInput | boolean
    delete?: WarehouseWhereInput | boolean
    connect?: WarehouseWhereUniqueInput
    update?: XOR<XOR<WarehouseUpdateToOneWithWhereWithoutStocksInput, WarehouseUpdateWithoutStocksInput>, WarehouseUncheckedUpdateWithoutStocksInput>
  }

  export type OutletUpdateOneWithoutStocksNestedInput = {
    create?: XOR<OutletCreateWithoutStocksInput, OutletUncheckedCreateWithoutStocksInput>
    connectOrCreate?: OutletCreateOrConnectWithoutStocksInput
    upsert?: OutletUpsertWithoutStocksInput
    disconnect?: OutletWhereInput | boolean
    delete?: OutletWhereInput | boolean
    connect?: OutletWhereUniqueInput
    update?: XOR<XOR<OutletUpdateToOneWithWhereWithoutStocksInput, OutletUpdateWithoutStocksInput>, OutletUncheckedUpdateWithoutStocksInput>
  }

  export type TransactionCreateNestedManyWithoutPartyInput = {
    create?: XOR<TransactionCreateWithoutPartyInput, TransactionUncheckedCreateWithoutPartyInput> | TransactionCreateWithoutPartyInput[] | TransactionUncheckedCreateWithoutPartyInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutPartyInput | TransactionCreateOrConnectWithoutPartyInput[]
    createMany?: TransactionCreateManyPartyInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type LedgerEntryCreateNestedManyWithoutPartyInput = {
    create?: XOR<LedgerEntryCreateWithoutPartyInput, LedgerEntryUncheckedCreateWithoutPartyInput> | LedgerEntryCreateWithoutPartyInput[] | LedgerEntryUncheckedCreateWithoutPartyInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutPartyInput | LedgerEntryCreateOrConnectWithoutPartyInput[]
    createMany?: LedgerEntryCreateManyPartyInputEnvelope
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
  }

  export type VendorProductCreateNestedManyWithoutVendorInput = {
    create?: XOR<VendorProductCreateWithoutVendorInput, VendorProductUncheckedCreateWithoutVendorInput> | VendorProductCreateWithoutVendorInput[] | VendorProductUncheckedCreateWithoutVendorInput[]
    connectOrCreate?: VendorProductCreateOrConnectWithoutVendorInput | VendorProductCreateOrConnectWithoutVendorInput[]
    createMany?: VendorProductCreateManyVendorInputEnvelope
    connect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
  }

  export type TransactionUncheckedCreateNestedManyWithoutPartyInput = {
    create?: XOR<TransactionCreateWithoutPartyInput, TransactionUncheckedCreateWithoutPartyInput> | TransactionCreateWithoutPartyInput[] | TransactionUncheckedCreateWithoutPartyInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutPartyInput | TransactionCreateOrConnectWithoutPartyInput[]
    createMany?: TransactionCreateManyPartyInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type LedgerEntryUncheckedCreateNestedManyWithoutPartyInput = {
    create?: XOR<LedgerEntryCreateWithoutPartyInput, LedgerEntryUncheckedCreateWithoutPartyInput> | LedgerEntryCreateWithoutPartyInput[] | LedgerEntryUncheckedCreateWithoutPartyInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutPartyInput | LedgerEntryCreateOrConnectWithoutPartyInput[]
    createMany?: LedgerEntryCreateManyPartyInputEnvelope
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
  }

  export type VendorProductUncheckedCreateNestedManyWithoutVendorInput = {
    create?: XOR<VendorProductCreateWithoutVendorInput, VendorProductUncheckedCreateWithoutVendorInput> | VendorProductCreateWithoutVendorInput[] | VendorProductUncheckedCreateWithoutVendorInput[]
    connectOrCreate?: VendorProductCreateOrConnectWithoutVendorInput | VendorProductCreateOrConnectWithoutVendorInput[]
    createMany?: VendorProductCreateManyVendorInputEnvelope
    connect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
  }

  export type EnumPartyTypeFieldUpdateOperationsInput = {
    set?: $Enums.PartyType
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TransactionUpdateManyWithoutPartyNestedInput = {
    create?: XOR<TransactionCreateWithoutPartyInput, TransactionUncheckedCreateWithoutPartyInput> | TransactionCreateWithoutPartyInput[] | TransactionUncheckedCreateWithoutPartyInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutPartyInput | TransactionCreateOrConnectWithoutPartyInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutPartyInput | TransactionUpsertWithWhereUniqueWithoutPartyInput[]
    createMany?: TransactionCreateManyPartyInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutPartyInput | TransactionUpdateWithWhereUniqueWithoutPartyInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutPartyInput | TransactionUpdateManyWithWhereWithoutPartyInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type LedgerEntryUpdateManyWithoutPartyNestedInput = {
    create?: XOR<LedgerEntryCreateWithoutPartyInput, LedgerEntryUncheckedCreateWithoutPartyInput> | LedgerEntryCreateWithoutPartyInput[] | LedgerEntryUncheckedCreateWithoutPartyInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutPartyInput | LedgerEntryCreateOrConnectWithoutPartyInput[]
    upsert?: LedgerEntryUpsertWithWhereUniqueWithoutPartyInput | LedgerEntryUpsertWithWhereUniqueWithoutPartyInput[]
    createMany?: LedgerEntryCreateManyPartyInputEnvelope
    set?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    disconnect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    delete?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    update?: LedgerEntryUpdateWithWhereUniqueWithoutPartyInput | LedgerEntryUpdateWithWhereUniqueWithoutPartyInput[]
    updateMany?: LedgerEntryUpdateManyWithWhereWithoutPartyInput | LedgerEntryUpdateManyWithWhereWithoutPartyInput[]
    deleteMany?: LedgerEntryScalarWhereInput | LedgerEntryScalarWhereInput[]
  }

  export type VendorProductUpdateManyWithoutVendorNestedInput = {
    create?: XOR<VendorProductCreateWithoutVendorInput, VendorProductUncheckedCreateWithoutVendorInput> | VendorProductCreateWithoutVendorInput[] | VendorProductUncheckedCreateWithoutVendorInput[]
    connectOrCreate?: VendorProductCreateOrConnectWithoutVendorInput | VendorProductCreateOrConnectWithoutVendorInput[]
    upsert?: VendorProductUpsertWithWhereUniqueWithoutVendorInput | VendorProductUpsertWithWhereUniqueWithoutVendorInput[]
    createMany?: VendorProductCreateManyVendorInputEnvelope
    set?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    disconnect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    delete?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    connect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    update?: VendorProductUpdateWithWhereUniqueWithoutVendorInput | VendorProductUpdateWithWhereUniqueWithoutVendorInput[]
    updateMany?: VendorProductUpdateManyWithWhereWithoutVendorInput | VendorProductUpdateManyWithWhereWithoutVendorInput[]
    deleteMany?: VendorProductScalarWhereInput | VendorProductScalarWhereInput[]
  }

  export type TransactionUncheckedUpdateManyWithoutPartyNestedInput = {
    create?: XOR<TransactionCreateWithoutPartyInput, TransactionUncheckedCreateWithoutPartyInput> | TransactionCreateWithoutPartyInput[] | TransactionUncheckedCreateWithoutPartyInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutPartyInput | TransactionCreateOrConnectWithoutPartyInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutPartyInput | TransactionUpsertWithWhereUniqueWithoutPartyInput[]
    createMany?: TransactionCreateManyPartyInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutPartyInput | TransactionUpdateWithWhereUniqueWithoutPartyInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutPartyInput | TransactionUpdateManyWithWhereWithoutPartyInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type LedgerEntryUncheckedUpdateManyWithoutPartyNestedInput = {
    create?: XOR<LedgerEntryCreateWithoutPartyInput, LedgerEntryUncheckedCreateWithoutPartyInput> | LedgerEntryCreateWithoutPartyInput[] | LedgerEntryUncheckedCreateWithoutPartyInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutPartyInput | LedgerEntryCreateOrConnectWithoutPartyInput[]
    upsert?: LedgerEntryUpsertWithWhereUniqueWithoutPartyInput | LedgerEntryUpsertWithWhereUniqueWithoutPartyInput[]
    createMany?: LedgerEntryCreateManyPartyInputEnvelope
    set?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    disconnect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    delete?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    update?: LedgerEntryUpdateWithWhereUniqueWithoutPartyInput | LedgerEntryUpdateWithWhereUniqueWithoutPartyInput[]
    updateMany?: LedgerEntryUpdateManyWithWhereWithoutPartyInput | LedgerEntryUpdateManyWithWhereWithoutPartyInput[]
    deleteMany?: LedgerEntryScalarWhereInput | LedgerEntryScalarWhereInput[]
  }

  export type VendorProductUncheckedUpdateManyWithoutVendorNestedInput = {
    create?: XOR<VendorProductCreateWithoutVendorInput, VendorProductUncheckedCreateWithoutVendorInput> | VendorProductCreateWithoutVendorInput[] | VendorProductUncheckedCreateWithoutVendorInput[]
    connectOrCreate?: VendorProductCreateOrConnectWithoutVendorInput | VendorProductCreateOrConnectWithoutVendorInput[]
    upsert?: VendorProductUpsertWithWhereUniqueWithoutVendorInput | VendorProductUpsertWithWhereUniqueWithoutVendorInput[]
    createMany?: VendorProductCreateManyVendorInputEnvelope
    set?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    disconnect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    delete?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    connect?: VendorProductWhereUniqueInput | VendorProductWhereUniqueInput[]
    update?: VendorProductUpdateWithWhereUniqueWithoutVendorInput | VendorProductUpdateWithWhereUniqueWithoutVendorInput[]
    updateMany?: VendorProductUpdateManyWithWhereWithoutVendorInput | VendorProductUpdateManyWithWhereWithoutVendorInput[]
    deleteMany?: VendorProductScalarWhereInput | VendorProductScalarWhereInput[]
  }

  export type PartyCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<PartyCreateWithoutTransactionsInput, PartyUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: PartyCreateOrConnectWithoutTransactionsInput
    connect?: PartyWhereUniqueInput
  }

  export type TransactionCreateNestedOneWithoutChildrenInput = {
    create?: XOR<TransactionCreateWithoutChildrenInput, TransactionUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutChildrenInput
    connect?: TransactionWhereUniqueInput
  }

  export type TransactionCreateNestedManyWithoutParentInput = {
    create?: XOR<TransactionCreateWithoutParentInput, TransactionUncheckedCreateWithoutParentInput> | TransactionCreateWithoutParentInput[] | TransactionUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutParentInput | TransactionCreateOrConnectWithoutParentInput[]
    createMany?: TransactionCreateManyParentInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type TransactionItemCreateNestedManyWithoutTransactionInput = {
    create?: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput> | TransactionItemCreateWithoutTransactionInput[] | TransactionItemUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutTransactionInput | TransactionItemCreateOrConnectWithoutTransactionInput[]
    createMany?: TransactionItemCreateManyTransactionInputEnvelope
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
  }

  export type LedgerEntryCreateNestedManyWithoutTransactionInput = {
    create?: XOR<LedgerEntryCreateWithoutTransactionInput, LedgerEntryUncheckedCreateWithoutTransactionInput> | LedgerEntryCreateWithoutTransactionInput[] | LedgerEntryUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutTransactionInput | LedgerEntryCreateOrConnectWithoutTransactionInput[]
    createMany?: LedgerEntryCreateManyTransactionInputEnvelope
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
  }

  export type TransactionUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<TransactionCreateWithoutParentInput, TransactionUncheckedCreateWithoutParentInput> | TransactionCreateWithoutParentInput[] | TransactionUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutParentInput | TransactionCreateOrConnectWithoutParentInput[]
    createMany?: TransactionCreateManyParentInputEnvelope
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
  }

  export type TransactionItemUncheckedCreateNestedManyWithoutTransactionInput = {
    create?: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput> | TransactionItemCreateWithoutTransactionInput[] | TransactionItemUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutTransactionInput | TransactionItemCreateOrConnectWithoutTransactionInput[]
    createMany?: TransactionItemCreateManyTransactionInputEnvelope
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
  }

  export type LedgerEntryUncheckedCreateNestedManyWithoutTransactionInput = {
    create?: XOR<LedgerEntryCreateWithoutTransactionInput, LedgerEntryUncheckedCreateWithoutTransactionInput> | LedgerEntryCreateWithoutTransactionInput[] | LedgerEntryUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutTransactionInput | LedgerEntryCreateOrConnectWithoutTransactionInput[]
    createMany?: LedgerEntryCreateManyTransactionInputEnvelope
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
  }

  export type EnumTxTypeFieldUpdateOperationsInput = {
    set?: $Enums.TxType
  }

  export type PartyUpdateOneWithoutTransactionsNestedInput = {
    create?: XOR<PartyCreateWithoutTransactionsInput, PartyUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: PartyCreateOrConnectWithoutTransactionsInput
    upsert?: PartyUpsertWithoutTransactionsInput
    disconnect?: PartyWhereInput | boolean
    delete?: PartyWhereInput | boolean
    connect?: PartyWhereUniqueInput
    update?: XOR<XOR<PartyUpdateToOneWithWhereWithoutTransactionsInput, PartyUpdateWithoutTransactionsInput>, PartyUncheckedUpdateWithoutTransactionsInput>
  }

  export type TransactionUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<TransactionCreateWithoutChildrenInput, TransactionUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutChildrenInput
    upsert?: TransactionUpsertWithoutChildrenInput
    disconnect?: TransactionWhereInput | boolean
    delete?: TransactionWhereInput | boolean
    connect?: TransactionWhereUniqueInput
    update?: XOR<XOR<TransactionUpdateToOneWithWhereWithoutChildrenInput, TransactionUpdateWithoutChildrenInput>, TransactionUncheckedUpdateWithoutChildrenInput>
  }

  export type TransactionUpdateManyWithoutParentNestedInput = {
    create?: XOR<TransactionCreateWithoutParentInput, TransactionUncheckedCreateWithoutParentInput> | TransactionCreateWithoutParentInput[] | TransactionUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutParentInput | TransactionCreateOrConnectWithoutParentInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutParentInput | TransactionUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: TransactionCreateManyParentInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutParentInput | TransactionUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutParentInput | TransactionUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type TransactionItemUpdateManyWithoutTransactionNestedInput = {
    create?: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput> | TransactionItemCreateWithoutTransactionInput[] | TransactionItemUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutTransactionInput | TransactionItemCreateOrConnectWithoutTransactionInput[]
    upsert?: TransactionItemUpsertWithWhereUniqueWithoutTransactionInput | TransactionItemUpsertWithWhereUniqueWithoutTransactionInput[]
    createMany?: TransactionItemCreateManyTransactionInputEnvelope
    set?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    disconnect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    delete?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    update?: TransactionItemUpdateWithWhereUniqueWithoutTransactionInput | TransactionItemUpdateWithWhereUniqueWithoutTransactionInput[]
    updateMany?: TransactionItemUpdateManyWithWhereWithoutTransactionInput | TransactionItemUpdateManyWithWhereWithoutTransactionInput[]
    deleteMany?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
  }

  export type LedgerEntryUpdateManyWithoutTransactionNestedInput = {
    create?: XOR<LedgerEntryCreateWithoutTransactionInput, LedgerEntryUncheckedCreateWithoutTransactionInput> | LedgerEntryCreateWithoutTransactionInput[] | LedgerEntryUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutTransactionInput | LedgerEntryCreateOrConnectWithoutTransactionInput[]
    upsert?: LedgerEntryUpsertWithWhereUniqueWithoutTransactionInput | LedgerEntryUpsertWithWhereUniqueWithoutTransactionInput[]
    createMany?: LedgerEntryCreateManyTransactionInputEnvelope
    set?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    disconnect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    delete?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    update?: LedgerEntryUpdateWithWhereUniqueWithoutTransactionInput | LedgerEntryUpdateWithWhereUniqueWithoutTransactionInput[]
    updateMany?: LedgerEntryUpdateManyWithWhereWithoutTransactionInput | LedgerEntryUpdateManyWithWhereWithoutTransactionInput[]
    deleteMany?: LedgerEntryScalarWhereInput | LedgerEntryScalarWhereInput[]
  }

  export type TransactionUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<TransactionCreateWithoutParentInput, TransactionUncheckedCreateWithoutParentInput> | TransactionCreateWithoutParentInput[] | TransactionUncheckedCreateWithoutParentInput[]
    connectOrCreate?: TransactionCreateOrConnectWithoutParentInput | TransactionCreateOrConnectWithoutParentInput[]
    upsert?: TransactionUpsertWithWhereUniqueWithoutParentInput | TransactionUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: TransactionCreateManyParentInputEnvelope
    set?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    disconnect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    delete?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    connect?: TransactionWhereUniqueInput | TransactionWhereUniqueInput[]
    update?: TransactionUpdateWithWhereUniqueWithoutParentInput | TransactionUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: TransactionUpdateManyWithWhereWithoutParentInput | TransactionUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
  }

  export type TransactionItemUncheckedUpdateManyWithoutTransactionNestedInput = {
    create?: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput> | TransactionItemCreateWithoutTransactionInput[] | TransactionItemUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutTransactionInput | TransactionItemCreateOrConnectWithoutTransactionInput[]
    upsert?: TransactionItemUpsertWithWhereUniqueWithoutTransactionInput | TransactionItemUpsertWithWhereUniqueWithoutTransactionInput[]
    createMany?: TransactionItemCreateManyTransactionInputEnvelope
    set?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    disconnect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    delete?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    update?: TransactionItemUpdateWithWhereUniqueWithoutTransactionInput | TransactionItemUpdateWithWhereUniqueWithoutTransactionInput[]
    updateMany?: TransactionItemUpdateManyWithWhereWithoutTransactionInput | TransactionItemUpdateManyWithWhereWithoutTransactionInput[]
    deleteMany?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
  }

  export type LedgerEntryUncheckedUpdateManyWithoutTransactionNestedInput = {
    create?: XOR<LedgerEntryCreateWithoutTransactionInput, LedgerEntryUncheckedCreateWithoutTransactionInput> | LedgerEntryCreateWithoutTransactionInput[] | LedgerEntryUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutTransactionInput | LedgerEntryCreateOrConnectWithoutTransactionInput[]
    upsert?: LedgerEntryUpsertWithWhereUniqueWithoutTransactionInput | LedgerEntryUpsertWithWhereUniqueWithoutTransactionInput[]
    createMany?: LedgerEntryCreateManyTransactionInputEnvelope
    set?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    disconnect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    delete?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    update?: LedgerEntryUpdateWithWhereUniqueWithoutTransactionInput | LedgerEntryUpdateWithWhereUniqueWithoutTransactionInput[]
    updateMany?: LedgerEntryUpdateManyWithWhereWithoutTransactionInput | LedgerEntryUpdateManyWithWhereWithoutTransactionInput[]
    deleteMany?: LedgerEntryScalarWhereInput | LedgerEntryScalarWhereInput[]
  }

  export type TransactionCreateNestedOneWithoutItemsInput = {
    create?: XOR<TransactionCreateWithoutItemsInput, TransactionUncheckedCreateWithoutItemsInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutItemsInput
    connect?: TransactionWhereUniqueInput
  }

  export type VariantCreateNestedOneWithoutTxnItemsInput = {
    create?: XOR<VariantCreateWithoutTxnItemsInput, VariantUncheckedCreateWithoutTxnItemsInput>
    connectOrCreate?: VariantCreateOrConnectWithoutTxnItemsInput
    connect?: VariantWhereUniqueInput
  }

  export type TransactionUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<TransactionCreateWithoutItemsInput, TransactionUncheckedCreateWithoutItemsInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutItemsInput
    upsert?: TransactionUpsertWithoutItemsInput
    connect?: TransactionWhereUniqueInput
    update?: XOR<XOR<TransactionUpdateToOneWithWhereWithoutItemsInput, TransactionUpdateWithoutItemsInput>, TransactionUncheckedUpdateWithoutItemsInput>
  }

  export type VariantUpdateOneRequiredWithoutTxnItemsNestedInput = {
    create?: XOR<VariantCreateWithoutTxnItemsInput, VariantUncheckedCreateWithoutTxnItemsInput>
    connectOrCreate?: VariantCreateOrConnectWithoutTxnItemsInput
    upsert?: VariantUpsertWithoutTxnItemsInput
    connect?: VariantWhereUniqueInput
    update?: XOR<XOR<VariantUpdateToOneWithWhereWithoutTxnItemsInput, VariantUpdateWithoutTxnItemsInput>, VariantUncheckedUpdateWithoutTxnItemsInput>
  }

  export type LedgerEntryCreateNestedManyWithoutAccountInput = {
    create?: XOR<LedgerEntryCreateWithoutAccountInput, LedgerEntryUncheckedCreateWithoutAccountInput> | LedgerEntryCreateWithoutAccountInput[] | LedgerEntryUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutAccountInput | LedgerEntryCreateOrConnectWithoutAccountInput[]
    createMany?: LedgerEntryCreateManyAccountInputEnvelope
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
  }

  export type LedgerEntryUncheckedCreateNestedManyWithoutAccountInput = {
    create?: XOR<LedgerEntryCreateWithoutAccountInput, LedgerEntryUncheckedCreateWithoutAccountInput> | LedgerEntryCreateWithoutAccountInput[] | LedgerEntryUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutAccountInput | LedgerEntryCreateOrConnectWithoutAccountInput[]
    createMany?: LedgerEntryCreateManyAccountInputEnvelope
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
  }

  export type EnumAccountGroupFieldUpdateOperationsInput = {
    set?: $Enums.AccountGroup
  }

  export type LedgerEntryUpdateManyWithoutAccountNestedInput = {
    create?: XOR<LedgerEntryCreateWithoutAccountInput, LedgerEntryUncheckedCreateWithoutAccountInput> | LedgerEntryCreateWithoutAccountInput[] | LedgerEntryUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutAccountInput | LedgerEntryCreateOrConnectWithoutAccountInput[]
    upsert?: LedgerEntryUpsertWithWhereUniqueWithoutAccountInput | LedgerEntryUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: LedgerEntryCreateManyAccountInputEnvelope
    set?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    disconnect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    delete?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    update?: LedgerEntryUpdateWithWhereUniqueWithoutAccountInput | LedgerEntryUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: LedgerEntryUpdateManyWithWhereWithoutAccountInput | LedgerEntryUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: LedgerEntryScalarWhereInput | LedgerEntryScalarWhereInput[]
  }

  export type LedgerEntryUncheckedUpdateManyWithoutAccountNestedInput = {
    create?: XOR<LedgerEntryCreateWithoutAccountInput, LedgerEntryUncheckedCreateWithoutAccountInput> | LedgerEntryCreateWithoutAccountInput[] | LedgerEntryUncheckedCreateWithoutAccountInput[]
    connectOrCreate?: LedgerEntryCreateOrConnectWithoutAccountInput | LedgerEntryCreateOrConnectWithoutAccountInput[]
    upsert?: LedgerEntryUpsertWithWhereUniqueWithoutAccountInput | LedgerEntryUpsertWithWhereUniqueWithoutAccountInput[]
    createMany?: LedgerEntryCreateManyAccountInputEnvelope
    set?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    disconnect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    delete?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    connect?: LedgerEntryWhereUniqueInput | LedgerEntryWhereUniqueInput[]
    update?: LedgerEntryUpdateWithWhereUniqueWithoutAccountInput | LedgerEntryUpdateWithWhereUniqueWithoutAccountInput[]
    updateMany?: LedgerEntryUpdateManyWithWhereWithoutAccountInput | LedgerEntryUpdateManyWithWhereWithoutAccountInput[]
    deleteMany?: LedgerEntryScalarWhereInput | LedgerEntryScalarWhereInput[]
  }

  export type AccountCreateNestedOneWithoutEntriesInput = {
    create?: XOR<AccountCreateWithoutEntriesInput, AccountUncheckedCreateWithoutEntriesInput>
    connectOrCreate?: AccountCreateOrConnectWithoutEntriesInput
    connect?: AccountWhereUniqueInput
  }

  export type PartyCreateNestedOneWithoutLedgerEntriesInput = {
    create?: XOR<PartyCreateWithoutLedgerEntriesInput, PartyUncheckedCreateWithoutLedgerEntriesInput>
    connectOrCreate?: PartyCreateOrConnectWithoutLedgerEntriesInput
    connect?: PartyWhereUniqueInput
  }

  export type TransactionCreateNestedOneWithoutLedgerEntriesInput = {
    create?: XOR<TransactionCreateWithoutLedgerEntriesInput, TransactionUncheckedCreateWithoutLedgerEntriesInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutLedgerEntriesInput
    connect?: TransactionWhereUniqueInput
  }

  export type AccountUpdateOneRequiredWithoutEntriesNestedInput = {
    create?: XOR<AccountCreateWithoutEntriesInput, AccountUncheckedCreateWithoutEntriesInput>
    connectOrCreate?: AccountCreateOrConnectWithoutEntriesInput
    upsert?: AccountUpsertWithoutEntriesInput
    connect?: AccountWhereUniqueInput
    update?: XOR<XOR<AccountUpdateToOneWithWhereWithoutEntriesInput, AccountUpdateWithoutEntriesInput>, AccountUncheckedUpdateWithoutEntriesInput>
  }

  export type PartyUpdateOneWithoutLedgerEntriesNestedInput = {
    create?: XOR<PartyCreateWithoutLedgerEntriesInput, PartyUncheckedCreateWithoutLedgerEntriesInput>
    connectOrCreate?: PartyCreateOrConnectWithoutLedgerEntriesInput
    upsert?: PartyUpsertWithoutLedgerEntriesInput
    disconnect?: PartyWhereInput | boolean
    delete?: PartyWhereInput | boolean
    connect?: PartyWhereUniqueInput
    update?: XOR<XOR<PartyUpdateToOneWithWhereWithoutLedgerEntriesInput, PartyUpdateWithoutLedgerEntriesInput>, PartyUncheckedUpdateWithoutLedgerEntriesInput>
  }

  export type TransactionUpdateOneWithoutLedgerEntriesNestedInput = {
    create?: XOR<TransactionCreateWithoutLedgerEntriesInput, TransactionUncheckedCreateWithoutLedgerEntriesInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutLedgerEntriesInput
    upsert?: TransactionUpsertWithoutLedgerEntriesInput
    disconnect?: TransactionWhereInput | boolean
    delete?: TransactionWhereInput | boolean
    connect?: TransactionWhereUniqueInput
    update?: XOR<XOR<TransactionUpdateToOneWithWhereWithoutLedgerEntriesInput, TransactionUpdateWithoutLedgerEntriesInput>, TransactionUncheckedUpdateWithoutLedgerEntriesInput>
  }

  export type PartyCreateNestedOneWithoutSuppliedProductsInput = {
    create?: XOR<PartyCreateWithoutSuppliedProductsInput, PartyUncheckedCreateWithoutSuppliedProductsInput>
    connectOrCreate?: PartyCreateOrConnectWithoutSuppliedProductsInput
    connect?: PartyWhereUniqueInput
  }

  export type VariantCreateNestedOneWithoutSuppliersInput = {
    create?: XOR<VariantCreateWithoutSuppliersInput, VariantUncheckedCreateWithoutSuppliersInput>
    connectOrCreate?: VariantCreateOrConnectWithoutSuppliersInput
    connect?: VariantWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PartyUpdateOneRequiredWithoutSuppliedProductsNestedInput = {
    create?: XOR<PartyCreateWithoutSuppliedProductsInput, PartyUncheckedCreateWithoutSuppliedProductsInput>
    connectOrCreate?: PartyCreateOrConnectWithoutSuppliedProductsInput
    upsert?: PartyUpsertWithoutSuppliedProductsInput
    connect?: PartyWhereUniqueInput
    update?: XOR<XOR<PartyUpdateToOneWithWhereWithoutSuppliedProductsInput, PartyUpdateWithoutSuppliedProductsInput>, PartyUncheckedUpdateWithoutSuppliedProductsInput>
  }

  export type VariantUpdateOneRequiredWithoutSuppliersNestedInput = {
    create?: XOR<VariantCreateWithoutSuppliersInput, VariantUncheckedCreateWithoutSuppliersInput>
    connectOrCreate?: VariantCreateOrConnectWithoutSuppliersInput
    upsert?: VariantUpsertWithoutSuppliersInput
    connect?: VariantWhereUniqueInput
    update?: XOR<XOR<VariantUpdateToOneWithWhereWithoutSuppliersInput, VariantUpdateWithoutSuppliersInput>, VariantUncheckedUpdateWithoutSuppliersInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumPartyTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PartyType | EnumPartyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PartyType[] | ListEnumPartyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PartyType[] | ListEnumPartyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPartyTypeFilter<$PrismaModel> | $Enums.PartyType
  }

  export type NestedEnumPartyTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PartyType | EnumPartyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PartyType[] | ListEnumPartyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PartyType[] | ListEnumPartyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPartyTypeWithAggregatesFilter<$PrismaModel> | $Enums.PartyType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPartyTypeFilter<$PrismaModel>
    _max?: NestedEnumPartyTypeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedEnumTxTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TxType | EnumTxTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TxType[] | ListEnumTxTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TxType[] | ListEnumTxTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTxTypeFilter<$PrismaModel> | $Enums.TxType
  }

  export type NestedEnumTxTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TxType | EnumTxTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TxType[] | ListEnumTxTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TxType[] | ListEnumTxTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTxTypeWithAggregatesFilter<$PrismaModel> | $Enums.TxType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTxTypeFilter<$PrismaModel>
    _max?: NestedEnumTxTypeFilter<$PrismaModel>
  }

  export type NestedEnumAccountGroupFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountGroup | EnumAccountGroupFieldRefInput<$PrismaModel>
    in?: $Enums.AccountGroup[] | ListEnumAccountGroupFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountGroup[] | ListEnumAccountGroupFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountGroupFilter<$PrismaModel> | $Enums.AccountGroup
  }

  export type NestedEnumAccountGroupWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AccountGroup | EnumAccountGroupFieldRefInput<$PrismaModel>
    in?: $Enums.AccountGroup[] | ListEnumAccountGroupFieldRefInput<$PrismaModel>
    notIn?: $Enums.AccountGroup[] | ListEnumAccountGroupFieldRefInput<$PrismaModel>
    not?: NestedEnumAccountGroupWithAggregatesFilter<$PrismaModel> | $Enums.AccountGroup
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAccountGroupFilter<$PrismaModel>
    _max?: NestedEnumAccountGroupFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type OutletCreateWithoutUsersInput = {
    id?: string
    name: string
    invoicePrefix: string
    gstin?: string | null
    bankDetails?: string | null
    negativeStockPolicy?: string
    warehouses?: WarehouseCreateNestedManyWithoutOutletsInput
    stocks?: StockCreateNestedManyWithoutOutletInput
  }

  export type OutletUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    invoicePrefix: string
    gstin?: string | null
    bankDetails?: string | null
    negativeStockPolicy?: string
    warehouses?: WarehouseUncheckedCreateNestedManyWithoutOutletsInput
    stocks?: StockUncheckedCreateNestedManyWithoutOutletInput
  }

  export type OutletCreateOrConnectWithoutUsersInput = {
    where: OutletWhereUniqueInput
    create: XOR<OutletCreateWithoutUsersInput, OutletUncheckedCreateWithoutUsersInput>
  }

  export type AuditLogCreateWithoutUserInput = {
    id?: string
    action: string
    entity: string
    entityId: string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogUncheckedCreateWithoutUserInput = {
    id?: string
    action: string
    entity: string
    entityId: string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type AuditLogCreateOrConnectWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    create: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
  }

  export type AuditLogCreateManyUserInputEnvelope = {
    data: AuditLogCreateManyUserInput | AuditLogCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type OutletUpsertWithWhereUniqueWithoutUsersInput = {
    where: OutletWhereUniqueInput
    update: XOR<OutletUpdateWithoutUsersInput, OutletUncheckedUpdateWithoutUsersInput>
    create: XOR<OutletCreateWithoutUsersInput, OutletUncheckedCreateWithoutUsersInput>
  }

  export type OutletUpdateWithWhereUniqueWithoutUsersInput = {
    where: OutletWhereUniqueInput
    data: XOR<OutletUpdateWithoutUsersInput, OutletUncheckedUpdateWithoutUsersInput>
  }

  export type OutletUpdateManyWithWhereWithoutUsersInput = {
    where: OutletScalarWhereInput
    data: XOR<OutletUpdateManyMutationInput, OutletUncheckedUpdateManyWithoutUsersInput>
  }

  export type OutletScalarWhereInput = {
    AND?: OutletScalarWhereInput | OutletScalarWhereInput[]
    OR?: OutletScalarWhereInput[]
    NOT?: OutletScalarWhereInput | OutletScalarWhereInput[]
    id?: StringFilter<"Outlet"> | string
    name?: StringFilter<"Outlet"> | string
    invoicePrefix?: StringFilter<"Outlet"> | string
    gstin?: StringNullableFilter<"Outlet"> | string | null
    bankDetails?: StringNullableFilter<"Outlet"> | string | null
    negativeStockPolicy?: StringFilter<"Outlet"> | string
  }

  export type AuditLogUpsertWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    update: XOR<AuditLogUpdateWithoutUserInput, AuditLogUncheckedUpdateWithoutUserInput>
    create: XOR<AuditLogCreateWithoutUserInput, AuditLogUncheckedCreateWithoutUserInput>
  }

  export type AuditLogUpdateWithWhereUniqueWithoutUserInput = {
    where: AuditLogWhereUniqueInput
    data: XOR<AuditLogUpdateWithoutUserInput, AuditLogUncheckedUpdateWithoutUserInput>
  }

  export type AuditLogUpdateManyWithWhereWithoutUserInput = {
    where: AuditLogScalarWhereInput
    data: XOR<AuditLogUpdateManyMutationInput, AuditLogUncheckedUpdateManyWithoutUserInput>
  }

  export type AuditLogScalarWhereInput = {
    AND?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    OR?: AuditLogScalarWhereInput[]
    NOT?: AuditLogScalarWhereInput | AuditLogScalarWhereInput[]
    id?: StringFilter<"AuditLog"> | string
    userId?: StringFilter<"AuditLog"> | string
    action?: StringFilter<"AuditLog"> | string
    entity?: StringFilter<"AuditLog"> | string
    entityId?: StringFilter<"AuditLog"> | string
    oldValues?: JsonNullableFilter<"AuditLog">
    newValues?: JsonNullableFilter<"AuditLog">
    createdAt?: DateTimeFilter<"AuditLog"> | Date | string
  }

  export type UserCreateWithoutActionsInput = {
    id?: string
    email: string
    name: string
    role: $Enums.Role
    password: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    outlets?: OutletCreateNestedManyWithoutUsersInput
  }

  export type UserUncheckedCreateWithoutActionsInput = {
    id?: string
    email: string
    name: string
    role: $Enums.Role
    password: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    outlets?: OutletUncheckedCreateNestedManyWithoutUsersInput
  }

  export type UserCreateOrConnectWithoutActionsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutActionsInput, UserUncheckedCreateWithoutActionsInput>
  }

  export type UserUpsertWithoutActionsInput = {
    update: XOR<UserUpdateWithoutActionsInput, UserUncheckedUpdateWithoutActionsInput>
    create: XOR<UserCreateWithoutActionsInput, UserUncheckedCreateWithoutActionsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutActionsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutActionsInput, UserUncheckedUpdateWithoutActionsInput>
  }

  export type UserUpdateWithoutActionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outlets?: OutletUpdateManyWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateWithoutActionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    outlets?: OutletUncheckedUpdateManyWithoutUsersNestedInput
  }

  export type OutletCreateWithoutWarehousesInput = {
    id?: string
    name: string
    invoicePrefix: string
    gstin?: string | null
    bankDetails?: string | null
    negativeStockPolicy?: string
    users?: UserCreateNestedManyWithoutOutletsInput
    stocks?: StockCreateNestedManyWithoutOutletInput
  }

  export type OutletUncheckedCreateWithoutWarehousesInput = {
    id?: string
    name: string
    invoicePrefix: string
    gstin?: string | null
    bankDetails?: string | null
    negativeStockPolicy?: string
    users?: UserUncheckedCreateNestedManyWithoutOutletsInput
    stocks?: StockUncheckedCreateNestedManyWithoutOutletInput
  }

  export type OutletCreateOrConnectWithoutWarehousesInput = {
    where: OutletWhereUniqueInput
    create: XOR<OutletCreateWithoutWarehousesInput, OutletUncheckedCreateWithoutWarehousesInput>
  }

  export type StockCreateWithoutWarehouseInput = {
    id?: string
    quantity?: number
    inTransitQty?: number
    variant: VariantCreateNestedOneWithoutStocksInput
    outlet?: OutletCreateNestedOneWithoutStocksInput
  }

  export type StockUncheckedCreateWithoutWarehouseInput = {
    id?: string
    variantId: string
    outletId?: string | null
    quantity?: number
    inTransitQty?: number
  }

  export type StockCreateOrConnectWithoutWarehouseInput = {
    where: StockWhereUniqueInput
    create: XOR<StockCreateWithoutWarehouseInput, StockUncheckedCreateWithoutWarehouseInput>
  }

  export type StockCreateManyWarehouseInputEnvelope = {
    data: StockCreateManyWarehouseInput | StockCreateManyWarehouseInput[]
    skipDuplicates?: boolean
  }

  export type OutletUpsertWithWhereUniqueWithoutWarehousesInput = {
    where: OutletWhereUniqueInput
    update: XOR<OutletUpdateWithoutWarehousesInput, OutletUncheckedUpdateWithoutWarehousesInput>
    create: XOR<OutletCreateWithoutWarehousesInput, OutletUncheckedCreateWithoutWarehousesInput>
  }

  export type OutletUpdateWithWhereUniqueWithoutWarehousesInput = {
    where: OutletWhereUniqueInput
    data: XOR<OutletUpdateWithoutWarehousesInput, OutletUncheckedUpdateWithoutWarehousesInput>
  }

  export type OutletUpdateManyWithWhereWithoutWarehousesInput = {
    where: OutletScalarWhereInput
    data: XOR<OutletUpdateManyMutationInput, OutletUncheckedUpdateManyWithoutWarehousesInput>
  }

  export type StockUpsertWithWhereUniqueWithoutWarehouseInput = {
    where: StockWhereUniqueInput
    update: XOR<StockUpdateWithoutWarehouseInput, StockUncheckedUpdateWithoutWarehouseInput>
    create: XOR<StockCreateWithoutWarehouseInput, StockUncheckedCreateWithoutWarehouseInput>
  }

  export type StockUpdateWithWhereUniqueWithoutWarehouseInput = {
    where: StockWhereUniqueInput
    data: XOR<StockUpdateWithoutWarehouseInput, StockUncheckedUpdateWithoutWarehouseInput>
  }

  export type StockUpdateManyWithWhereWithoutWarehouseInput = {
    where: StockScalarWhereInput
    data: XOR<StockUpdateManyMutationInput, StockUncheckedUpdateManyWithoutWarehouseInput>
  }

  export type StockScalarWhereInput = {
    AND?: StockScalarWhereInput | StockScalarWhereInput[]
    OR?: StockScalarWhereInput[]
    NOT?: StockScalarWhereInput | StockScalarWhereInput[]
    id?: StringFilter<"Stock"> | string
    variantId?: StringFilter<"Stock"> | string
    warehouseId?: StringNullableFilter<"Stock"> | string | null
    outletId?: StringNullableFilter<"Stock"> | string | null
    quantity?: FloatFilter<"Stock"> | number
    inTransitQty?: FloatFilter<"Stock"> | number
  }

  export type WarehouseCreateWithoutOutletsInput = {
    id?: string
    name: string
    address?: string | null
    stocks?: StockCreateNestedManyWithoutWarehouseInput
  }

  export type WarehouseUncheckedCreateWithoutOutletsInput = {
    id?: string
    name: string
    address?: string | null
    stocks?: StockUncheckedCreateNestedManyWithoutWarehouseInput
  }

  export type WarehouseCreateOrConnectWithoutOutletsInput = {
    where: WarehouseWhereUniqueInput
    create: XOR<WarehouseCreateWithoutOutletsInput, WarehouseUncheckedCreateWithoutOutletsInput>
  }

  export type UserCreateWithoutOutletsInput = {
    id?: string
    email: string
    name: string
    role: $Enums.Role
    password: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    actions?: AuditLogCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutOutletsInput = {
    id?: string
    email: string
    name: string
    role: $Enums.Role
    password: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    actions?: AuditLogUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutOutletsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutOutletsInput, UserUncheckedCreateWithoutOutletsInput>
  }

  export type StockCreateWithoutOutletInput = {
    id?: string
    quantity?: number
    inTransitQty?: number
    variant: VariantCreateNestedOneWithoutStocksInput
    warehouse?: WarehouseCreateNestedOneWithoutStocksInput
  }

  export type StockUncheckedCreateWithoutOutletInput = {
    id?: string
    variantId: string
    warehouseId?: string | null
    quantity?: number
    inTransitQty?: number
  }

  export type StockCreateOrConnectWithoutOutletInput = {
    where: StockWhereUniqueInput
    create: XOR<StockCreateWithoutOutletInput, StockUncheckedCreateWithoutOutletInput>
  }

  export type StockCreateManyOutletInputEnvelope = {
    data: StockCreateManyOutletInput | StockCreateManyOutletInput[]
    skipDuplicates?: boolean
  }

  export type WarehouseUpsertWithWhereUniqueWithoutOutletsInput = {
    where: WarehouseWhereUniqueInput
    update: XOR<WarehouseUpdateWithoutOutletsInput, WarehouseUncheckedUpdateWithoutOutletsInput>
    create: XOR<WarehouseCreateWithoutOutletsInput, WarehouseUncheckedCreateWithoutOutletsInput>
  }

  export type WarehouseUpdateWithWhereUniqueWithoutOutletsInput = {
    where: WarehouseWhereUniqueInput
    data: XOR<WarehouseUpdateWithoutOutletsInput, WarehouseUncheckedUpdateWithoutOutletsInput>
  }

  export type WarehouseUpdateManyWithWhereWithoutOutletsInput = {
    where: WarehouseScalarWhereInput
    data: XOR<WarehouseUpdateManyMutationInput, WarehouseUncheckedUpdateManyWithoutOutletsInput>
  }

  export type WarehouseScalarWhereInput = {
    AND?: WarehouseScalarWhereInput | WarehouseScalarWhereInput[]
    OR?: WarehouseScalarWhereInput[]
    NOT?: WarehouseScalarWhereInput | WarehouseScalarWhereInput[]
    id?: StringFilter<"Warehouse"> | string
    name?: StringFilter<"Warehouse"> | string
    address?: StringNullableFilter<"Warehouse"> | string | null
  }

  export type UserUpsertWithWhereUniqueWithoutOutletsInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutOutletsInput, UserUncheckedUpdateWithoutOutletsInput>
    create: XOR<UserCreateWithoutOutletsInput, UserUncheckedCreateWithoutOutletsInput>
  }

  export type UserUpdateWithWhereUniqueWithoutOutletsInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutOutletsInput, UserUncheckedUpdateWithoutOutletsInput>
  }

  export type UserUpdateManyWithWhereWithoutOutletsInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutOutletsInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    password?: StringFilter<"User"> | string
    isActive?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type StockUpsertWithWhereUniqueWithoutOutletInput = {
    where: StockWhereUniqueInput
    update: XOR<StockUpdateWithoutOutletInput, StockUncheckedUpdateWithoutOutletInput>
    create: XOR<StockCreateWithoutOutletInput, StockUncheckedCreateWithoutOutletInput>
  }

  export type StockUpdateWithWhereUniqueWithoutOutletInput = {
    where: StockWhereUniqueInput
    data: XOR<StockUpdateWithoutOutletInput, StockUncheckedUpdateWithoutOutletInput>
  }

  export type StockUpdateManyWithWhereWithoutOutletInput = {
    where: StockScalarWhereInput
    data: XOR<StockUpdateManyMutationInput, StockUncheckedUpdateManyWithoutOutletInput>
  }

  export type CategoryCreateWithoutChildrenInput = {
    id?: string
    name: string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    products?: ProductCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateWithoutChildrenInput = {
    id?: string
    name: string
    parentId?: string | null
    products?: ProductUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryCreateOrConnectWithoutChildrenInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
  }

  export type CategoryCreateWithoutParentInput = {
    id?: string
    name: string
    children?: CategoryCreateNestedManyWithoutParentInput
    products?: ProductCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateWithoutParentInput = {
    id?: string
    name: string
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
    products?: ProductUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryCreateOrConnectWithoutParentInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput>
  }

  export type CategoryCreateManyParentInputEnvelope = {
    data: CategoryCreateManyParentInput | CategoryCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type ProductCreateWithoutCategoryInput = {
    id?: string
    name: string
    brand?: string | null
    hsnCode: string
    gstRate: number
    baseUnit: string
    purchaseUnit?: string | null
    salesUnit?: string | null
    conversionRatio?: number | null
    isArchived?: boolean
    variants?: VariantCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutCategoryInput = {
    id?: string
    name: string
    brand?: string | null
    hsnCode: string
    gstRate: number
    baseUnit: string
    purchaseUnit?: string | null
    salesUnit?: string | null
    conversionRatio?: number | null
    isArchived?: boolean
    variants?: VariantUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutCategoryInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput>
  }

  export type ProductCreateManyCategoryInputEnvelope = {
    data: ProductCreateManyCategoryInput | ProductCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type CategoryUpsertWithoutChildrenInput = {
    update: XOR<CategoryUpdateWithoutChildrenInput, CategoryUncheckedUpdateWithoutChildrenInput>
    create: XOR<CategoryCreateWithoutChildrenInput, CategoryUncheckedCreateWithoutChildrenInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutChildrenInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutChildrenInput, CategoryUncheckedUpdateWithoutChildrenInput>
  }

  export type CategoryUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    products?: ProductUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    products?: ProductUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUpsertWithWhereUniqueWithoutParentInput = {
    where: CategoryWhereUniqueInput
    update: XOR<CategoryUpdateWithoutParentInput, CategoryUncheckedUpdateWithoutParentInput>
    create: XOR<CategoryCreateWithoutParentInput, CategoryUncheckedCreateWithoutParentInput>
  }

  export type CategoryUpdateWithWhereUniqueWithoutParentInput = {
    where: CategoryWhereUniqueInput
    data: XOR<CategoryUpdateWithoutParentInput, CategoryUncheckedUpdateWithoutParentInput>
  }

  export type CategoryUpdateManyWithWhereWithoutParentInput = {
    where: CategoryScalarWhereInput
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyWithoutParentInput>
  }

  export type CategoryScalarWhereInput = {
    AND?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
    OR?: CategoryScalarWhereInput[]
    NOT?: CategoryScalarWhereInput | CategoryScalarWhereInput[]
    id?: StringFilter<"Category"> | string
    name?: StringFilter<"Category"> | string
    parentId?: StringNullableFilter<"Category"> | string | null
  }

  export type ProductUpsertWithWhereUniqueWithoutCategoryInput = {
    where: ProductWhereUniqueInput
    update: XOR<ProductUpdateWithoutCategoryInput, ProductUncheckedUpdateWithoutCategoryInput>
    create: XOR<ProductCreateWithoutCategoryInput, ProductUncheckedCreateWithoutCategoryInput>
  }

  export type ProductUpdateWithWhereUniqueWithoutCategoryInput = {
    where: ProductWhereUniqueInput
    data: XOR<ProductUpdateWithoutCategoryInput, ProductUncheckedUpdateWithoutCategoryInput>
  }

  export type ProductUpdateManyWithWhereWithoutCategoryInput = {
    where: ProductScalarWhereInput
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyWithoutCategoryInput>
  }

  export type ProductScalarWhereInput = {
    AND?: ProductScalarWhereInput | ProductScalarWhereInput[]
    OR?: ProductScalarWhereInput[]
    NOT?: ProductScalarWhereInput | ProductScalarWhereInput[]
    id?: StringFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    brand?: StringNullableFilter<"Product"> | string | null
    hsnCode?: StringFilter<"Product"> | string
    gstRate?: FloatFilter<"Product"> | number
    baseUnit?: StringFilter<"Product"> | string
    purchaseUnit?: StringNullableFilter<"Product"> | string | null
    salesUnit?: StringNullableFilter<"Product"> | string | null
    conversionRatio?: FloatNullableFilter<"Product"> | number | null
    categoryId?: StringFilter<"Product"> | string
    isArchived?: BoolFilter<"Product"> | boolean
  }

  export type CategoryCreateWithoutProductsInput = {
    id?: string
    name: string
    parent?: CategoryCreateNestedOneWithoutChildrenInput
    children?: CategoryCreateNestedManyWithoutParentInput
  }

  export type CategoryUncheckedCreateWithoutProductsInput = {
    id?: string
    name: string
    parentId?: string | null
    children?: CategoryUncheckedCreateNestedManyWithoutParentInput
  }

  export type CategoryCreateOrConnectWithoutProductsInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutProductsInput, CategoryUncheckedCreateWithoutProductsInput>
  }

  export type VariantCreateWithoutProductInput = {
    id?: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
    stocks?: StockCreateNestedManyWithoutVariantInput
    txnItems?: TransactionItemCreateNestedManyWithoutVariantInput
    suppliers?: VendorProductCreateNestedManyWithoutVariantInput
  }

  export type VariantUncheckedCreateWithoutProductInput = {
    id?: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
    stocks?: StockUncheckedCreateNestedManyWithoutVariantInput
    txnItems?: TransactionItemUncheckedCreateNestedManyWithoutVariantInput
    suppliers?: VendorProductUncheckedCreateNestedManyWithoutVariantInput
  }

  export type VariantCreateOrConnectWithoutProductInput = {
    where: VariantWhereUniqueInput
    create: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput>
  }

  export type VariantCreateManyProductInputEnvelope = {
    data: VariantCreateManyProductInput | VariantCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type CategoryUpsertWithoutProductsInput = {
    update: XOR<CategoryUpdateWithoutProductsInput, CategoryUncheckedUpdateWithoutProductsInput>
    create: XOR<CategoryCreateWithoutProductsInput, CategoryUncheckedCreateWithoutProductsInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutProductsInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutProductsInput, CategoryUncheckedUpdateWithoutProductsInput>
  }

  export type CategoryUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parent?: CategoryUpdateOneWithoutChildrenNestedInput
    children?: CategoryUpdateManyWithoutParentNestedInput
  }

  export type CategoryUncheckedUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
  }

  export type VariantUpsertWithWhereUniqueWithoutProductInput = {
    where: VariantWhereUniqueInput
    update: XOR<VariantUpdateWithoutProductInput, VariantUncheckedUpdateWithoutProductInput>
    create: XOR<VariantCreateWithoutProductInput, VariantUncheckedCreateWithoutProductInput>
  }

  export type VariantUpdateWithWhereUniqueWithoutProductInput = {
    where: VariantWhereUniqueInput
    data: XOR<VariantUpdateWithoutProductInput, VariantUncheckedUpdateWithoutProductInput>
  }

  export type VariantUpdateManyWithWhereWithoutProductInput = {
    where: VariantScalarWhereInput
    data: XOR<VariantUpdateManyMutationInput, VariantUncheckedUpdateManyWithoutProductInput>
  }

  export type VariantScalarWhereInput = {
    AND?: VariantScalarWhereInput | VariantScalarWhereInput[]
    OR?: VariantScalarWhereInput[]
    NOT?: VariantScalarWhereInput | VariantScalarWhereInput[]
    id?: StringFilter<"Variant"> | string
    productId?: StringFilter<"Variant"> | string
    sku?: StringFilter<"Variant"> | string
    specifications?: JsonNullableFilter<"Variant">
    purchasePrice?: FloatFilter<"Variant"> | number
    sellingPrice?: FloatFilter<"Variant"> | number
    pricingMethod?: StringFilter<"Variant"> | string
    markupPercent?: FloatNullableFilter<"Variant"> | number | null
    minStockLevel?: FloatFilter<"Variant"> | number
  }

  export type ProductCreateWithoutVariantsInput = {
    id?: string
    name: string
    brand?: string | null
    hsnCode: string
    gstRate: number
    baseUnit: string
    purchaseUnit?: string | null
    salesUnit?: string | null
    conversionRatio?: number | null
    isArchived?: boolean
    category: CategoryCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateWithoutVariantsInput = {
    id?: string
    name: string
    brand?: string | null
    hsnCode: string
    gstRate: number
    baseUnit: string
    purchaseUnit?: string | null
    salesUnit?: string | null
    conversionRatio?: number | null
    categoryId: string
    isArchived?: boolean
  }

  export type ProductCreateOrConnectWithoutVariantsInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutVariantsInput, ProductUncheckedCreateWithoutVariantsInput>
  }

  export type StockCreateWithoutVariantInput = {
    id?: string
    quantity?: number
    inTransitQty?: number
    warehouse?: WarehouseCreateNestedOneWithoutStocksInput
    outlet?: OutletCreateNestedOneWithoutStocksInput
  }

  export type StockUncheckedCreateWithoutVariantInput = {
    id?: string
    warehouseId?: string | null
    outletId?: string | null
    quantity?: number
    inTransitQty?: number
  }

  export type StockCreateOrConnectWithoutVariantInput = {
    where: StockWhereUniqueInput
    create: XOR<StockCreateWithoutVariantInput, StockUncheckedCreateWithoutVariantInput>
  }

  export type StockCreateManyVariantInputEnvelope = {
    data: StockCreateManyVariantInput | StockCreateManyVariantInput[]
    skipDuplicates?: boolean
  }

  export type TransactionItemCreateWithoutVariantInput = {
    id?: string
    quantity: number
    rate: number
    freightFraction?: number | null
    taxableValue: number
    cgst?: number
    sgst?: number
    igst?: number
    transaction: TransactionCreateNestedOneWithoutItemsInput
  }

  export type TransactionItemUncheckedCreateWithoutVariantInput = {
    id?: string
    transactionId: string
    quantity: number
    rate: number
    freightFraction?: number | null
    taxableValue: number
    cgst?: number
    sgst?: number
    igst?: number
  }

  export type TransactionItemCreateOrConnectWithoutVariantInput = {
    where: TransactionItemWhereUniqueInput
    create: XOR<TransactionItemCreateWithoutVariantInput, TransactionItemUncheckedCreateWithoutVariantInput>
  }

  export type TransactionItemCreateManyVariantInputEnvelope = {
    data: TransactionItemCreateManyVariantInput | TransactionItemCreateManyVariantInput[]
    skipDuplicates?: boolean
  }

  export type VendorProductCreateWithoutVariantInput = {
    id?: string
    lastPrice?: number | null
    leadTime?: number | null
    vendor: PartyCreateNestedOneWithoutSuppliedProductsInput
  }

  export type VendorProductUncheckedCreateWithoutVariantInput = {
    id?: string
    vendorId: string
    lastPrice?: number | null
    leadTime?: number | null
  }

  export type VendorProductCreateOrConnectWithoutVariantInput = {
    where: VendorProductWhereUniqueInput
    create: XOR<VendorProductCreateWithoutVariantInput, VendorProductUncheckedCreateWithoutVariantInput>
  }

  export type VendorProductCreateManyVariantInputEnvelope = {
    data: VendorProductCreateManyVariantInput | VendorProductCreateManyVariantInput[]
    skipDuplicates?: boolean
  }

  export type ProductUpsertWithoutVariantsInput = {
    update: XOR<ProductUpdateWithoutVariantsInput, ProductUncheckedUpdateWithoutVariantsInput>
    create: XOR<ProductCreateWithoutVariantsInput, ProductUncheckedCreateWithoutVariantsInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutVariantsInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutVariantsInput, ProductUncheckedUpdateWithoutVariantsInput>
  }

  export type ProductUpdateWithoutVariantsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brand?: NullableStringFieldUpdateOperationsInput | string | null
    hsnCode?: StringFieldUpdateOperationsInput | string
    gstRate?: FloatFieldUpdateOperationsInput | number
    baseUnit?: StringFieldUpdateOperationsInput | string
    purchaseUnit?: NullableStringFieldUpdateOperationsInput | string | null
    salesUnit?: NullableStringFieldUpdateOperationsInput | string | null
    conversionRatio?: NullableFloatFieldUpdateOperationsInput | number | null
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    category?: CategoryUpdateOneRequiredWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutVariantsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brand?: NullableStringFieldUpdateOperationsInput | string | null
    hsnCode?: StringFieldUpdateOperationsInput | string
    gstRate?: FloatFieldUpdateOperationsInput | number
    baseUnit?: StringFieldUpdateOperationsInput | string
    purchaseUnit?: NullableStringFieldUpdateOperationsInput | string | null
    salesUnit?: NullableStringFieldUpdateOperationsInput | string | null
    conversionRatio?: NullableFloatFieldUpdateOperationsInput | number | null
    categoryId?: StringFieldUpdateOperationsInput | string
    isArchived?: BoolFieldUpdateOperationsInput | boolean
  }

  export type StockUpsertWithWhereUniqueWithoutVariantInput = {
    where: StockWhereUniqueInput
    update: XOR<StockUpdateWithoutVariantInput, StockUncheckedUpdateWithoutVariantInput>
    create: XOR<StockCreateWithoutVariantInput, StockUncheckedCreateWithoutVariantInput>
  }

  export type StockUpdateWithWhereUniqueWithoutVariantInput = {
    where: StockWhereUniqueInput
    data: XOR<StockUpdateWithoutVariantInput, StockUncheckedUpdateWithoutVariantInput>
  }

  export type StockUpdateManyWithWhereWithoutVariantInput = {
    where: StockScalarWhereInput
    data: XOR<StockUpdateManyMutationInput, StockUncheckedUpdateManyWithoutVariantInput>
  }

  export type TransactionItemUpsertWithWhereUniqueWithoutVariantInput = {
    where: TransactionItemWhereUniqueInput
    update: XOR<TransactionItemUpdateWithoutVariantInput, TransactionItemUncheckedUpdateWithoutVariantInput>
    create: XOR<TransactionItemCreateWithoutVariantInput, TransactionItemUncheckedCreateWithoutVariantInput>
  }

  export type TransactionItemUpdateWithWhereUniqueWithoutVariantInput = {
    where: TransactionItemWhereUniqueInput
    data: XOR<TransactionItemUpdateWithoutVariantInput, TransactionItemUncheckedUpdateWithoutVariantInput>
  }

  export type TransactionItemUpdateManyWithWhereWithoutVariantInput = {
    where: TransactionItemScalarWhereInput
    data: XOR<TransactionItemUpdateManyMutationInput, TransactionItemUncheckedUpdateManyWithoutVariantInput>
  }

  export type TransactionItemScalarWhereInput = {
    AND?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
    OR?: TransactionItemScalarWhereInput[]
    NOT?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
    id?: StringFilter<"TransactionItem"> | string
    transactionId?: StringFilter<"TransactionItem"> | string
    variantId?: StringFilter<"TransactionItem"> | string
    quantity?: FloatFilter<"TransactionItem"> | number
    rate?: FloatFilter<"TransactionItem"> | number
    freightFraction?: FloatNullableFilter<"TransactionItem"> | number | null
    taxableValue?: FloatFilter<"TransactionItem"> | number
    cgst?: FloatFilter<"TransactionItem"> | number
    sgst?: FloatFilter<"TransactionItem"> | number
    igst?: FloatFilter<"TransactionItem"> | number
  }

  export type VendorProductUpsertWithWhereUniqueWithoutVariantInput = {
    where: VendorProductWhereUniqueInput
    update: XOR<VendorProductUpdateWithoutVariantInput, VendorProductUncheckedUpdateWithoutVariantInput>
    create: XOR<VendorProductCreateWithoutVariantInput, VendorProductUncheckedCreateWithoutVariantInput>
  }

  export type VendorProductUpdateWithWhereUniqueWithoutVariantInput = {
    where: VendorProductWhereUniqueInput
    data: XOR<VendorProductUpdateWithoutVariantInput, VendorProductUncheckedUpdateWithoutVariantInput>
  }

  export type VendorProductUpdateManyWithWhereWithoutVariantInput = {
    where: VendorProductScalarWhereInput
    data: XOR<VendorProductUpdateManyMutationInput, VendorProductUncheckedUpdateManyWithoutVariantInput>
  }

  export type VendorProductScalarWhereInput = {
    AND?: VendorProductScalarWhereInput | VendorProductScalarWhereInput[]
    OR?: VendorProductScalarWhereInput[]
    NOT?: VendorProductScalarWhereInput | VendorProductScalarWhereInput[]
    id?: StringFilter<"VendorProduct"> | string
    vendorId?: StringFilter<"VendorProduct"> | string
    variantId?: StringFilter<"VendorProduct"> | string
    lastPrice?: FloatNullableFilter<"VendorProduct"> | number | null
    leadTime?: IntNullableFilter<"VendorProduct"> | number | null
  }

  export type VariantCreateWithoutStocksInput = {
    id?: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
    product: ProductCreateNestedOneWithoutVariantsInput
    txnItems?: TransactionItemCreateNestedManyWithoutVariantInput
    suppliers?: VendorProductCreateNestedManyWithoutVariantInput
  }

  export type VariantUncheckedCreateWithoutStocksInput = {
    id?: string
    productId: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
    txnItems?: TransactionItemUncheckedCreateNestedManyWithoutVariantInput
    suppliers?: VendorProductUncheckedCreateNestedManyWithoutVariantInput
  }

  export type VariantCreateOrConnectWithoutStocksInput = {
    where: VariantWhereUniqueInput
    create: XOR<VariantCreateWithoutStocksInput, VariantUncheckedCreateWithoutStocksInput>
  }

  export type WarehouseCreateWithoutStocksInput = {
    id?: string
    name: string
    address?: string | null
    outlets?: OutletCreateNestedManyWithoutWarehousesInput
  }

  export type WarehouseUncheckedCreateWithoutStocksInput = {
    id?: string
    name: string
    address?: string | null
    outlets?: OutletUncheckedCreateNestedManyWithoutWarehousesInput
  }

  export type WarehouseCreateOrConnectWithoutStocksInput = {
    where: WarehouseWhereUniqueInput
    create: XOR<WarehouseCreateWithoutStocksInput, WarehouseUncheckedCreateWithoutStocksInput>
  }

  export type OutletCreateWithoutStocksInput = {
    id?: string
    name: string
    invoicePrefix: string
    gstin?: string | null
    bankDetails?: string | null
    negativeStockPolicy?: string
    warehouses?: WarehouseCreateNestedManyWithoutOutletsInput
    users?: UserCreateNestedManyWithoutOutletsInput
  }

  export type OutletUncheckedCreateWithoutStocksInput = {
    id?: string
    name: string
    invoicePrefix: string
    gstin?: string | null
    bankDetails?: string | null
    negativeStockPolicy?: string
    warehouses?: WarehouseUncheckedCreateNestedManyWithoutOutletsInput
    users?: UserUncheckedCreateNestedManyWithoutOutletsInput
  }

  export type OutletCreateOrConnectWithoutStocksInput = {
    where: OutletWhereUniqueInput
    create: XOR<OutletCreateWithoutStocksInput, OutletUncheckedCreateWithoutStocksInput>
  }

  export type VariantUpsertWithoutStocksInput = {
    update: XOR<VariantUpdateWithoutStocksInput, VariantUncheckedUpdateWithoutStocksInput>
    create: XOR<VariantCreateWithoutStocksInput, VariantUncheckedCreateWithoutStocksInput>
    where?: VariantWhereInput
  }

  export type VariantUpdateToOneWithWhereWithoutStocksInput = {
    where?: VariantWhereInput
    data: XOR<VariantUpdateWithoutStocksInput, VariantUncheckedUpdateWithoutStocksInput>
  }

  export type VariantUpdateWithoutStocksInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
    product?: ProductUpdateOneRequiredWithoutVariantsNestedInput
    txnItems?: TransactionItemUpdateManyWithoutVariantNestedInput
    suppliers?: VendorProductUpdateManyWithoutVariantNestedInput
  }

  export type VariantUncheckedUpdateWithoutStocksInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
    txnItems?: TransactionItemUncheckedUpdateManyWithoutVariantNestedInput
    suppliers?: VendorProductUncheckedUpdateManyWithoutVariantNestedInput
  }

  export type WarehouseUpsertWithoutStocksInput = {
    update: XOR<WarehouseUpdateWithoutStocksInput, WarehouseUncheckedUpdateWithoutStocksInput>
    create: XOR<WarehouseCreateWithoutStocksInput, WarehouseUncheckedCreateWithoutStocksInput>
    where?: WarehouseWhereInput
  }

  export type WarehouseUpdateToOneWithWhereWithoutStocksInput = {
    where?: WarehouseWhereInput
    data: XOR<WarehouseUpdateWithoutStocksInput, WarehouseUncheckedUpdateWithoutStocksInput>
  }

  export type WarehouseUpdateWithoutStocksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    outlets?: OutletUpdateManyWithoutWarehousesNestedInput
  }

  export type WarehouseUncheckedUpdateWithoutStocksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    outlets?: OutletUncheckedUpdateManyWithoutWarehousesNestedInput
  }

  export type OutletUpsertWithoutStocksInput = {
    update: XOR<OutletUpdateWithoutStocksInput, OutletUncheckedUpdateWithoutStocksInput>
    create: XOR<OutletCreateWithoutStocksInput, OutletUncheckedCreateWithoutStocksInput>
    where?: OutletWhereInput
  }

  export type OutletUpdateToOneWithWhereWithoutStocksInput = {
    where?: OutletWhereInput
    data: XOR<OutletUpdateWithoutStocksInput, OutletUncheckedUpdateWithoutStocksInput>
  }

  export type OutletUpdateWithoutStocksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
    warehouses?: WarehouseUpdateManyWithoutOutletsNestedInput
    users?: UserUpdateManyWithoutOutletsNestedInput
  }

  export type OutletUncheckedUpdateWithoutStocksInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
    warehouses?: WarehouseUncheckedUpdateManyWithoutOutletsNestedInput
    users?: UserUncheckedUpdateManyWithoutOutletsNestedInput
  }

  export type TransactionCreateWithoutPartyInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    parent?: TransactionCreateNestedOneWithoutChildrenInput
    children?: TransactionCreateNestedManyWithoutParentInput
    items?: TransactionItemCreateNestedManyWithoutTransactionInput
    ledgerEntries?: LedgerEntryCreateNestedManyWithoutTransactionInput
  }

  export type TransactionUncheckedCreateWithoutPartyInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    parentId?: string | null
    children?: TransactionUncheckedCreateNestedManyWithoutParentInput
    items?: TransactionItemUncheckedCreateNestedManyWithoutTransactionInput
    ledgerEntries?: LedgerEntryUncheckedCreateNestedManyWithoutTransactionInput
  }

  export type TransactionCreateOrConnectWithoutPartyInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutPartyInput, TransactionUncheckedCreateWithoutPartyInput>
  }

  export type TransactionCreateManyPartyInputEnvelope = {
    data: TransactionCreateManyPartyInput | TransactionCreateManyPartyInput[]
    skipDuplicates?: boolean
  }

  export type LedgerEntryCreateWithoutPartyInput = {
    id?: string
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
    account: AccountCreateNestedOneWithoutEntriesInput
    transaction?: TransactionCreateNestedOneWithoutLedgerEntriesInput
  }

  export type LedgerEntryUncheckedCreateWithoutPartyInput = {
    id?: string
    accountId: string
    transactionId?: string | null
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
  }

  export type LedgerEntryCreateOrConnectWithoutPartyInput = {
    where: LedgerEntryWhereUniqueInput
    create: XOR<LedgerEntryCreateWithoutPartyInput, LedgerEntryUncheckedCreateWithoutPartyInput>
  }

  export type LedgerEntryCreateManyPartyInputEnvelope = {
    data: LedgerEntryCreateManyPartyInput | LedgerEntryCreateManyPartyInput[]
    skipDuplicates?: boolean
  }

  export type VendorProductCreateWithoutVendorInput = {
    id?: string
    lastPrice?: number | null
    leadTime?: number | null
    variant: VariantCreateNestedOneWithoutSuppliersInput
  }

  export type VendorProductUncheckedCreateWithoutVendorInput = {
    id?: string
    variantId: string
    lastPrice?: number | null
    leadTime?: number | null
  }

  export type VendorProductCreateOrConnectWithoutVendorInput = {
    where: VendorProductWhereUniqueInput
    create: XOR<VendorProductCreateWithoutVendorInput, VendorProductUncheckedCreateWithoutVendorInput>
  }

  export type VendorProductCreateManyVendorInputEnvelope = {
    data: VendorProductCreateManyVendorInput | VendorProductCreateManyVendorInput[]
    skipDuplicates?: boolean
  }

  export type TransactionUpsertWithWhereUniqueWithoutPartyInput = {
    where: TransactionWhereUniqueInput
    update: XOR<TransactionUpdateWithoutPartyInput, TransactionUncheckedUpdateWithoutPartyInput>
    create: XOR<TransactionCreateWithoutPartyInput, TransactionUncheckedCreateWithoutPartyInput>
  }

  export type TransactionUpdateWithWhereUniqueWithoutPartyInput = {
    where: TransactionWhereUniqueInput
    data: XOR<TransactionUpdateWithoutPartyInput, TransactionUncheckedUpdateWithoutPartyInput>
  }

  export type TransactionUpdateManyWithWhereWithoutPartyInput = {
    where: TransactionScalarWhereInput
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyWithoutPartyInput>
  }

  export type TransactionScalarWhereInput = {
    AND?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    OR?: TransactionScalarWhereInput[]
    NOT?: TransactionScalarWhereInput | TransactionScalarWhereInput[]
    id?: StringFilter<"Transaction"> | string
    type?: EnumTxTypeFilter<"Transaction"> | $Enums.TxType
    txnNumber?: StringFilter<"Transaction"> | string
    date?: DateTimeFilter<"Transaction"> | Date | string
    partyId?: StringNullableFilter<"Transaction"> | string | null
    fromLocationId?: StringNullableFilter<"Transaction"> | string | null
    toLocationId?: StringNullableFilter<"Transaction"> | string | null
    totalTaxable?: FloatFilter<"Transaction"> | number
    totalTax?: FloatFilter<"Transaction"> | number
    freightCost?: FloatNullableFilter<"Transaction"> | number | null
    grandTotal?: FloatFilter<"Transaction"> | number
    status?: StringFilter<"Transaction"> | string
    parentId?: StringNullableFilter<"Transaction"> | string | null
  }

  export type LedgerEntryUpsertWithWhereUniqueWithoutPartyInput = {
    where: LedgerEntryWhereUniqueInput
    update: XOR<LedgerEntryUpdateWithoutPartyInput, LedgerEntryUncheckedUpdateWithoutPartyInput>
    create: XOR<LedgerEntryCreateWithoutPartyInput, LedgerEntryUncheckedCreateWithoutPartyInput>
  }

  export type LedgerEntryUpdateWithWhereUniqueWithoutPartyInput = {
    where: LedgerEntryWhereUniqueInput
    data: XOR<LedgerEntryUpdateWithoutPartyInput, LedgerEntryUncheckedUpdateWithoutPartyInput>
  }

  export type LedgerEntryUpdateManyWithWhereWithoutPartyInput = {
    where: LedgerEntryScalarWhereInput
    data: XOR<LedgerEntryUpdateManyMutationInput, LedgerEntryUncheckedUpdateManyWithoutPartyInput>
  }

  export type LedgerEntryScalarWhereInput = {
    AND?: LedgerEntryScalarWhereInput | LedgerEntryScalarWhereInput[]
    OR?: LedgerEntryScalarWhereInput[]
    NOT?: LedgerEntryScalarWhereInput | LedgerEntryScalarWhereInput[]
    id?: StringFilter<"LedgerEntry"> | string
    accountId?: StringFilter<"LedgerEntry"> | string
    partyId?: StringNullableFilter<"LedgerEntry"> | string | null
    transactionId?: StringNullableFilter<"LedgerEntry"> | string | null
    date?: DateTimeFilter<"LedgerEntry"> | Date | string
    debit?: FloatFilter<"LedgerEntry"> | number
    credit?: FloatFilter<"LedgerEntry"> | number
    reference?: StringNullableFilter<"LedgerEntry"> | string | null
    isReconciled?: BoolFilter<"LedgerEntry"> | boolean
  }

  export type VendorProductUpsertWithWhereUniqueWithoutVendorInput = {
    where: VendorProductWhereUniqueInput
    update: XOR<VendorProductUpdateWithoutVendorInput, VendorProductUncheckedUpdateWithoutVendorInput>
    create: XOR<VendorProductCreateWithoutVendorInput, VendorProductUncheckedCreateWithoutVendorInput>
  }

  export type VendorProductUpdateWithWhereUniqueWithoutVendorInput = {
    where: VendorProductWhereUniqueInput
    data: XOR<VendorProductUpdateWithoutVendorInput, VendorProductUncheckedUpdateWithoutVendorInput>
  }

  export type VendorProductUpdateManyWithWhereWithoutVendorInput = {
    where: VendorProductScalarWhereInput
    data: XOR<VendorProductUpdateManyMutationInput, VendorProductUncheckedUpdateManyWithoutVendorInput>
  }

  export type PartyCreateWithoutTransactionsInput = {
    id?: string
    type: $Enums.PartyType
    name: string
    gstin?: string | null
    pan?: string | null
    address: string
    state: string
    contactInfo?: string | null
    creditPeriod?: number
    creditLimit?: number | null
    openingBalance?: number
    ledgerEntries?: LedgerEntryCreateNestedManyWithoutPartyInput
    suppliedProducts?: VendorProductCreateNestedManyWithoutVendorInput
  }

  export type PartyUncheckedCreateWithoutTransactionsInput = {
    id?: string
    type: $Enums.PartyType
    name: string
    gstin?: string | null
    pan?: string | null
    address: string
    state: string
    contactInfo?: string | null
    creditPeriod?: number
    creditLimit?: number | null
    openingBalance?: number
    ledgerEntries?: LedgerEntryUncheckedCreateNestedManyWithoutPartyInput
    suppliedProducts?: VendorProductUncheckedCreateNestedManyWithoutVendorInput
  }

  export type PartyCreateOrConnectWithoutTransactionsInput = {
    where: PartyWhereUniqueInput
    create: XOR<PartyCreateWithoutTransactionsInput, PartyUncheckedCreateWithoutTransactionsInput>
  }

  export type TransactionCreateWithoutChildrenInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    party?: PartyCreateNestedOneWithoutTransactionsInput
    parent?: TransactionCreateNestedOneWithoutChildrenInput
    items?: TransactionItemCreateNestedManyWithoutTransactionInput
    ledgerEntries?: LedgerEntryCreateNestedManyWithoutTransactionInput
  }

  export type TransactionUncheckedCreateWithoutChildrenInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    partyId?: string | null
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    parentId?: string | null
    items?: TransactionItemUncheckedCreateNestedManyWithoutTransactionInput
    ledgerEntries?: LedgerEntryUncheckedCreateNestedManyWithoutTransactionInput
  }

  export type TransactionCreateOrConnectWithoutChildrenInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutChildrenInput, TransactionUncheckedCreateWithoutChildrenInput>
  }

  export type TransactionCreateWithoutParentInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    party?: PartyCreateNestedOneWithoutTransactionsInput
    children?: TransactionCreateNestedManyWithoutParentInput
    items?: TransactionItemCreateNestedManyWithoutTransactionInput
    ledgerEntries?: LedgerEntryCreateNestedManyWithoutTransactionInput
  }

  export type TransactionUncheckedCreateWithoutParentInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    partyId?: string | null
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    children?: TransactionUncheckedCreateNestedManyWithoutParentInput
    items?: TransactionItemUncheckedCreateNestedManyWithoutTransactionInput
    ledgerEntries?: LedgerEntryUncheckedCreateNestedManyWithoutTransactionInput
  }

  export type TransactionCreateOrConnectWithoutParentInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutParentInput, TransactionUncheckedCreateWithoutParentInput>
  }

  export type TransactionCreateManyParentInputEnvelope = {
    data: TransactionCreateManyParentInput | TransactionCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type TransactionItemCreateWithoutTransactionInput = {
    id?: string
    quantity: number
    rate: number
    freightFraction?: number | null
    taxableValue: number
    cgst?: number
    sgst?: number
    igst?: number
    variant: VariantCreateNestedOneWithoutTxnItemsInput
  }

  export type TransactionItemUncheckedCreateWithoutTransactionInput = {
    id?: string
    variantId: string
    quantity: number
    rate: number
    freightFraction?: number | null
    taxableValue: number
    cgst?: number
    sgst?: number
    igst?: number
  }

  export type TransactionItemCreateOrConnectWithoutTransactionInput = {
    where: TransactionItemWhereUniqueInput
    create: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput>
  }

  export type TransactionItemCreateManyTransactionInputEnvelope = {
    data: TransactionItemCreateManyTransactionInput | TransactionItemCreateManyTransactionInput[]
    skipDuplicates?: boolean
  }

  export type LedgerEntryCreateWithoutTransactionInput = {
    id?: string
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
    account: AccountCreateNestedOneWithoutEntriesInput
    party?: PartyCreateNestedOneWithoutLedgerEntriesInput
  }

  export type LedgerEntryUncheckedCreateWithoutTransactionInput = {
    id?: string
    accountId: string
    partyId?: string | null
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
  }

  export type LedgerEntryCreateOrConnectWithoutTransactionInput = {
    where: LedgerEntryWhereUniqueInput
    create: XOR<LedgerEntryCreateWithoutTransactionInput, LedgerEntryUncheckedCreateWithoutTransactionInput>
  }

  export type LedgerEntryCreateManyTransactionInputEnvelope = {
    data: LedgerEntryCreateManyTransactionInput | LedgerEntryCreateManyTransactionInput[]
    skipDuplicates?: boolean
  }

  export type PartyUpsertWithoutTransactionsInput = {
    update: XOR<PartyUpdateWithoutTransactionsInput, PartyUncheckedUpdateWithoutTransactionsInput>
    create: XOR<PartyCreateWithoutTransactionsInput, PartyUncheckedCreateWithoutTransactionsInput>
    where?: PartyWhereInput
  }

  export type PartyUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: PartyWhereInput
    data: XOR<PartyUpdateWithoutTransactionsInput, PartyUncheckedUpdateWithoutTransactionsInput>
  }

  export type PartyUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPartyTypeFieldUpdateOperationsInput | $Enums.PartyType
    name?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    contactInfo?: NullableStringFieldUpdateOperationsInput | string | null
    creditPeriod?: IntFieldUpdateOperationsInput | number
    creditLimit?: NullableFloatFieldUpdateOperationsInput | number | null
    openingBalance?: FloatFieldUpdateOperationsInput | number
    ledgerEntries?: LedgerEntryUpdateManyWithoutPartyNestedInput
    suppliedProducts?: VendorProductUpdateManyWithoutVendorNestedInput
  }

  export type PartyUncheckedUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPartyTypeFieldUpdateOperationsInput | $Enums.PartyType
    name?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    contactInfo?: NullableStringFieldUpdateOperationsInput | string | null
    creditPeriod?: IntFieldUpdateOperationsInput | number
    creditLimit?: NullableFloatFieldUpdateOperationsInput | number | null
    openingBalance?: FloatFieldUpdateOperationsInput | number
    ledgerEntries?: LedgerEntryUncheckedUpdateManyWithoutPartyNestedInput
    suppliedProducts?: VendorProductUncheckedUpdateManyWithoutVendorNestedInput
  }

  export type TransactionUpsertWithoutChildrenInput = {
    update: XOR<TransactionUpdateWithoutChildrenInput, TransactionUncheckedUpdateWithoutChildrenInput>
    create: XOR<TransactionCreateWithoutChildrenInput, TransactionUncheckedCreateWithoutChildrenInput>
    where?: TransactionWhereInput
  }

  export type TransactionUpdateToOneWithWhereWithoutChildrenInput = {
    where?: TransactionWhereInput
    data: XOR<TransactionUpdateWithoutChildrenInput, TransactionUncheckedUpdateWithoutChildrenInput>
  }

  export type TransactionUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    party?: PartyUpdateOneWithoutTransactionsNestedInput
    parent?: TransactionUpdateOneWithoutChildrenNestedInput
    items?: TransactionItemUpdateManyWithoutTransactionNestedInput
    ledgerEntries?: LedgerEntryUpdateManyWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    items?: TransactionItemUncheckedUpdateManyWithoutTransactionNestedInput
    ledgerEntries?: LedgerEntryUncheckedUpdateManyWithoutTransactionNestedInput
  }

  export type TransactionUpsertWithWhereUniqueWithoutParentInput = {
    where: TransactionWhereUniqueInput
    update: XOR<TransactionUpdateWithoutParentInput, TransactionUncheckedUpdateWithoutParentInput>
    create: XOR<TransactionCreateWithoutParentInput, TransactionUncheckedCreateWithoutParentInput>
  }

  export type TransactionUpdateWithWhereUniqueWithoutParentInput = {
    where: TransactionWhereUniqueInput
    data: XOR<TransactionUpdateWithoutParentInput, TransactionUncheckedUpdateWithoutParentInput>
  }

  export type TransactionUpdateManyWithWhereWithoutParentInput = {
    where: TransactionScalarWhereInput
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyWithoutParentInput>
  }

  export type TransactionItemUpsertWithWhereUniqueWithoutTransactionInput = {
    where: TransactionItemWhereUniqueInput
    update: XOR<TransactionItemUpdateWithoutTransactionInput, TransactionItemUncheckedUpdateWithoutTransactionInput>
    create: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput>
  }

  export type TransactionItemUpdateWithWhereUniqueWithoutTransactionInput = {
    where: TransactionItemWhereUniqueInput
    data: XOR<TransactionItemUpdateWithoutTransactionInput, TransactionItemUncheckedUpdateWithoutTransactionInput>
  }

  export type TransactionItemUpdateManyWithWhereWithoutTransactionInput = {
    where: TransactionItemScalarWhereInput
    data: XOR<TransactionItemUpdateManyMutationInput, TransactionItemUncheckedUpdateManyWithoutTransactionInput>
  }

  export type LedgerEntryUpsertWithWhereUniqueWithoutTransactionInput = {
    where: LedgerEntryWhereUniqueInput
    update: XOR<LedgerEntryUpdateWithoutTransactionInput, LedgerEntryUncheckedUpdateWithoutTransactionInput>
    create: XOR<LedgerEntryCreateWithoutTransactionInput, LedgerEntryUncheckedCreateWithoutTransactionInput>
  }

  export type LedgerEntryUpdateWithWhereUniqueWithoutTransactionInput = {
    where: LedgerEntryWhereUniqueInput
    data: XOR<LedgerEntryUpdateWithoutTransactionInput, LedgerEntryUncheckedUpdateWithoutTransactionInput>
  }

  export type LedgerEntryUpdateManyWithWhereWithoutTransactionInput = {
    where: LedgerEntryScalarWhereInput
    data: XOR<LedgerEntryUpdateManyMutationInput, LedgerEntryUncheckedUpdateManyWithoutTransactionInput>
  }

  export type TransactionCreateWithoutItemsInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    party?: PartyCreateNestedOneWithoutTransactionsInput
    parent?: TransactionCreateNestedOneWithoutChildrenInput
    children?: TransactionCreateNestedManyWithoutParentInput
    ledgerEntries?: LedgerEntryCreateNestedManyWithoutTransactionInput
  }

  export type TransactionUncheckedCreateWithoutItemsInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    partyId?: string | null
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    parentId?: string | null
    children?: TransactionUncheckedCreateNestedManyWithoutParentInput
    ledgerEntries?: LedgerEntryUncheckedCreateNestedManyWithoutTransactionInput
  }

  export type TransactionCreateOrConnectWithoutItemsInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutItemsInput, TransactionUncheckedCreateWithoutItemsInput>
  }

  export type VariantCreateWithoutTxnItemsInput = {
    id?: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
    product: ProductCreateNestedOneWithoutVariantsInput
    stocks?: StockCreateNestedManyWithoutVariantInput
    suppliers?: VendorProductCreateNestedManyWithoutVariantInput
  }

  export type VariantUncheckedCreateWithoutTxnItemsInput = {
    id?: string
    productId: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
    stocks?: StockUncheckedCreateNestedManyWithoutVariantInput
    suppliers?: VendorProductUncheckedCreateNestedManyWithoutVariantInput
  }

  export type VariantCreateOrConnectWithoutTxnItemsInput = {
    where: VariantWhereUniqueInput
    create: XOR<VariantCreateWithoutTxnItemsInput, VariantUncheckedCreateWithoutTxnItemsInput>
  }

  export type TransactionUpsertWithoutItemsInput = {
    update: XOR<TransactionUpdateWithoutItemsInput, TransactionUncheckedUpdateWithoutItemsInput>
    create: XOR<TransactionCreateWithoutItemsInput, TransactionUncheckedCreateWithoutItemsInput>
    where?: TransactionWhereInput
  }

  export type TransactionUpdateToOneWithWhereWithoutItemsInput = {
    where?: TransactionWhereInput
    data: XOR<TransactionUpdateWithoutItemsInput, TransactionUncheckedUpdateWithoutItemsInput>
  }

  export type TransactionUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    party?: PartyUpdateOneWithoutTransactionsNestedInput
    parent?: TransactionUpdateOneWithoutChildrenNestedInput
    children?: TransactionUpdateManyWithoutParentNestedInput
    ledgerEntries?: LedgerEntryUpdateManyWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    children?: TransactionUncheckedUpdateManyWithoutParentNestedInput
    ledgerEntries?: LedgerEntryUncheckedUpdateManyWithoutTransactionNestedInput
  }

  export type VariantUpsertWithoutTxnItemsInput = {
    update: XOR<VariantUpdateWithoutTxnItemsInput, VariantUncheckedUpdateWithoutTxnItemsInput>
    create: XOR<VariantCreateWithoutTxnItemsInput, VariantUncheckedCreateWithoutTxnItemsInput>
    where?: VariantWhereInput
  }

  export type VariantUpdateToOneWithWhereWithoutTxnItemsInput = {
    where?: VariantWhereInput
    data: XOR<VariantUpdateWithoutTxnItemsInput, VariantUncheckedUpdateWithoutTxnItemsInput>
  }

  export type VariantUpdateWithoutTxnItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
    product?: ProductUpdateOneRequiredWithoutVariantsNestedInput
    stocks?: StockUpdateManyWithoutVariantNestedInput
    suppliers?: VendorProductUpdateManyWithoutVariantNestedInput
  }

  export type VariantUncheckedUpdateWithoutTxnItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
    stocks?: StockUncheckedUpdateManyWithoutVariantNestedInput
    suppliers?: VendorProductUncheckedUpdateManyWithoutVariantNestedInput
  }

  export type LedgerEntryCreateWithoutAccountInput = {
    id?: string
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
    party?: PartyCreateNestedOneWithoutLedgerEntriesInput
    transaction?: TransactionCreateNestedOneWithoutLedgerEntriesInput
  }

  export type LedgerEntryUncheckedCreateWithoutAccountInput = {
    id?: string
    partyId?: string | null
    transactionId?: string | null
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
  }

  export type LedgerEntryCreateOrConnectWithoutAccountInput = {
    where: LedgerEntryWhereUniqueInput
    create: XOR<LedgerEntryCreateWithoutAccountInput, LedgerEntryUncheckedCreateWithoutAccountInput>
  }

  export type LedgerEntryCreateManyAccountInputEnvelope = {
    data: LedgerEntryCreateManyAccountInput | LedgerEntryCreateManyAccountInput[]
    skipDuplicates?: boolean
  }

  export type LedgerEntryUpsertWithWhereUniqueWithoutAccountInput = {
    where: LedgerEntryWhereUniqueInput
    update: XOR<LedgerEntryUpdateWithoutAccountInput, LedgerEntryUncheckedUpdateWithoutAccountInput>
    create: XOR<LedgerEntryCreateWithoutAccountInput, LedgerEntryUncheckedCreateWithoutAccountInput>
  }

  export type LedgerEntryUpdateWithWhereUniqueWithoutAccountInput = {
    where: LedgerEntryWhereUniqueInput
    data: XOR<LedgerEntryUpdateWithoutAccountInput, LedgerEntryUncheckedUpdateWithoutAccountInput>
  }

  export type LedgerEntryUpdateManyWithWhereWithoutAccountInput = {
    where: LedgerEntryScalarWhereInput
    data: XOR<LedgerEntryUpdateManyMutationInput, LedgerEntryUncheckedUpdateManyWithoutAccountInput>
  }

  export type AccountCreateWithoutEntriesInput = {
    id?: string
    code: string
    name: string
    group: $Enums.AccountGroup
    isSystem?: boolean
  }

  export type AccountUncheckedCreateWithoutEntriesInput = {
    id?: string
    code: string
    name: string
    group: $Enums.AccountGroup
    isSystem?: boolean
  }

  export type AccountCreateOrConnectWithoutEntriesInput = {
    where: AccountWhereUniqueInput
    create: XOR<AccountCreateWithoutEntriesInput, AccountUncheckedCreateWithoutEntriesInput>
  }

  export type PartyCreateWithoutLedgerEntriesInput = {
    id?: string
    type: $Enums.PartyType
    name: string
    gstin?: string | null
    pan?: string | null
    address: string
    state: string
    contactInfo?: string | null
    creditPeriod?: number
    creditLimit?: number | null
    openingBalance?: number
    transactions?: TransactionCreateNestedManyWithoutPartyInput
    suppliedProducts?: VendorProductCreateNestedManyWithoutVendorInput
  }

  export type PartyUncheckedCreateWithoutLedgerEntriesInput = {
    id?: string
    type: $Enums.PartyType
    name: string
    gstin?: string | null
    pan?: string | null
    address: string
    state: string
    contactInfo?: string | null
    creditPeriod?: number
    creditLimit?: number | null
    openingBalance?: number
    transactions?: TransactionUncheckedCreateNestedManyWithoutPartyInput
    suppliedProducts?: VendorProductUncheckedCreateNestedManyWithoutVendorInput
  }

  export type PartyCreateOrConnectWithoutLedgerEntriesInput = {
    where: PartyWhereUniqueInput
    create: XOR<PartyCreateWithoutLedgerEntriesInput, PartyUncheckedCreateWithoutLedgerEntriesInput>
  }

  export type TransactionCreateWithoutLedgerEntriesInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    party?: PartyCreateNestedOneWithoutTransactionsInput
    parent?: TransactionCreateNestedOneWithoutChildrenInput
    children?: TransactionCreateNestedManyWithoutParentInput
    items?: TransactionItemCreateNestedManyWithoutTransactionInput
  }

  export type TransactionUncheckedCreateWithoutLedgerEntriesInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    partyId?: string | null
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    parentId?: string | null
    children?: TransactionUncheckedCreateNestedManyWithoutParentInput
    items?: TransactionItemUncheckedCreateNestedManyWithoutTransactionInput
  }

  export type TransactionCreateOrConnectWithoutLedgerEntriesInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutLedgerEntriesInput, TransactionUncheckedCreateWithoutLedgerEntriesInput>
  }

  export type AccountUpsertWithoutEntriesInput = {
    update: XOR<AccountUpdateWithoutEntriesInput, AccountUncheckedUpdateWithoutEntriesInput>
    create: XOR<AccountCreateWithoutEntriesInput, AccountUncheckedCreateWithoutEntriesInput>
    where?: AccountWhereInput
  }

  export type AccountUpdateToOneWithWhereWithoutEntriesInput = {
    where?: AccountWhereInput
    data: XOR<AccountUpdateWithoutEntriesInput, AccountUncheckedUpdateWithoutEntriesInput>
  }

  export type AccountUpdateWithoutEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    group?: EnumAccountGroupFieldUpdateOperationsInput | $Enums.AccountGroup
    isSystem?: BoolFieldUpdateOperationsInput | boolean
  }

  export type AccountUncheckedUpdateWithoutEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    group?: EnumAccountGroupFieldUpdateOperationsInput | $Enums.AccountGroup
    isSystem?: BoolFieldUpdateOperationsInput | boolean
  }

  export type PartyUpsertWithoutLedgerEntriesInput = {
    update: XOR<PartyUpdateWithoutLedgerEntriesInput, PartyUncheckedUpdateWithoutLedgerEntriesInput>
    create: XOR<PartyCreateWithoutLedgerEntriesInput, PartyUncheckedCreateWithoutLedgerEntriesInput>
    where?: PartyWhereInput
  }

  export type PartyUpdateToOneWithWhereWithoutLedgerEntriesInput = {
    where?: PartyWhereInput
    data: XOR<PartyUpdateWithoutLedgerEntriesInput, PartyUncheckedUpdateWithoutLedgerEntriesInput>
  }

  export type PartyUpdateWithoutLedgerEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPartyTypeFieldUpdateOperationsInput | $Enums.PartyType
    name?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    contactInfo?: NullableStringFieldUpdateOperationsInput | string | null
    creditPeriod?: IntFieldUpdateOperationsInput | number
    creditLimit?: NullableFloatFieldUpdateOperationsInput | number | null
    openingBalance?: FloatFieldUpdateOperationsInput | number
    transactions?: TransactionUpdateManyWithoutPartyNestedInput
    suppliedProducts?: VendorProductUpdateManyWithoutVendorNestedInput
  }

  export type PartyUncheckedUpdateWithoutLedgerEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPartyTypeFieldUpdateOperationsInput | $Enums.PartyType
    name?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    contactInfo?: NullableStringFieldUpdateOperationsInput | string | null
    creditPeriod?: IntFieldUpdateOperationsInput | number
    creditLimit?: NullableFloatFieldUpdateOperationsInput | number | null
    openingBalance?: FloatFieldUpdateOperationsInput | number
    transactions?: TransactionUncheckedUpdateManyWithoutPartyNestedInput
    suppliedProducts?: VendorProductUncheckedUpdateManyWithoutVendorNestedInput
  }

  export type TransactionUpsertWithoutLedgerEntriesInput = {
    update: XOR<TransactionUpdateWithoutLedgerEntriesInput, TransactionUncheckedUpdateWithoutLedgerEntriesInput>
    create: XOR<TransactionCreateWithoutLedgerEntriesInput, TransactionUncheckedCreateWithoutLedgerEntriesInput>
    where?: TransactionWhereInput
  }

  export type TransactionUpdateToOneWithWhereWithoutLedgerEntriesInput = {
    where?: TransactionWhereInput
    data: XOR<TransactionUpdateWithoutLedgerEntriesInput, TransactionUncheckedUpdateWithoutLedgerEntriesInput>
  }

  export type TransactionUpdateWithoutLedgerEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    party?: PartyUpdateOneWithoutTransactionsNestedInput
    parent?: TransactionUpdateOneWithoutChildrenNestedInput
    children?: TransactionUpdateManyWithoutParentNestedInput
    items?: TransactionItemUpdateManyWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateWithoutLedgerEntriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    children?: TransactionUncheckedUpdateManyWithoutParentNestedInput
    items?: TransactionItemUncheckedUpdateManyWithoutTransactionNestedInput
  }

  export type PartyCreateWithoutSuppliedProductsInput = {
    id?: string
    type: $Enums.PartyType
    name: string
    gstin?: string | null
    pan?: string | null
    address: string
    state: string
    contactInfo?: string | null
    creditPeriod?: number
    creditLimit?: number | null
    openingBalance?: number
    transactions?: TransactionCreateNestedManyWithoutPartyInput
    ledgerEntries?: LedgerEntryCreateNestedManyWithoutPartyInput
  }

  export type PartyUncheckedCreateWithoutSuppliedProductsInput = {
    id?: string
    type: $Enums.PartyType
    name: string
    gstin?: string | null
    pan?: string | null
    address: string
    state: string
    contactInfo?: string | null
    creditPeriod?: number
    creditLimit?: number | null
    openingBalance?: number
    transactions?: TransactionUncheckedCreateNestedManyWithoutPartyInput
    ledgerEntries?: LedgerEntryUncheckedCreateNestedManyWithoutPartyInput
  }

  export type PartyCreateOrConnectWithoutSuppliedProductsInput = {
    where: PartyWhereUniqueInput
    create: XOR<PartyCreateWithoutSuppliedProductsInput, PartyUncheckedCreateWithoutSuppliedProductsInput>
  }

  export type VariantCreateWithoutSuppliersInput = {
    id?: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
    product: ProductCreateNestedOneWithoutVariantsInput
    stocks?: StockCreateNestedManyWithoutVariantInput
    txnItems?: TransactionItemCreateNestedManyWithoutVariantInput
  }

  export type VariantUncheckedCreateWithoutSuppliersInput = {
    id?: string
    productId: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
    stocks?: StockUncheckedCreateNestedManyWithoutVariantInput
    txnItems?: TransactionItemUncheckedCreateNestedManyWithoutVariantInput
  }

  export type VariantCreateOrConnectWithoutSuppliersInput = {
    where: VariantWhereUniqueInput
    create: XOR<VariantCreateWithoutSuppliersInput, VariantUncheckedCreateWithoutSuppliersInput>
  }

  export type PartyUpsertWithoutSuppliedProductsInput = {
    update: XOR<PartyUpdateWithoutSuppliedProductsInput, PartyUncheckedUpdateWithoutSuppliedProductsInput>
    create: XOR<PartyCreateWithoutSuppliedProductsInput, PartyUncheckedCreateWithoutSuppliedProductsInput>
    where?: PartyWhereInput
  }

  export type PartyUpdateToOneWithWhereWithoutSuppliedProductsInput = {
    where?: PartyWhereInput
    data: XOR<PartyUpdateWithoutSuppliedProductsInput, PartyUncheckedUpdateWithoutSuppliedProductsInput>
  }

  export type PartyUpdateWithoutSuppliedProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPartyTypeFieldUpdateOperationsInput | $Enums.PartyType
    name?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    contactInfo?: NullableStringFieldUpdateOperationsInput | string | null
    creditPeriod?: IntFieldUpdateOperationsInput | number
    creditLimit?: NullableFloatFieldUpdateOperationsInput | number | null
    openingBalance?: FloatFieldUpdateOperationsInput | number
    transactions?: TransactionUpdateManyWithoutPartyNestedInput
    ledgerEntries?: LedgerEntryUpdateManyWithoutPartyNestedInput
  }

  export type PartyUncheckedUpdateWithoutSuppliedProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumPartyTypeFieldUpdateOperationsInput | $Enums.PartyType
    name?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    pan?: NullableStringFieldUpdateOperationsInput | string | null
    address?: StringFieldUpdateOperationsInput | string
    state?: StringFieldUpdateOperationsInput | string
    contactInfo?: NullableStringFieldUpdateOperationsInput | string | null
    creditPeriod?: IntFieldUpdateOperationsInput | number
    creditLimit?: NullableFloatFieldUpdateOperationsInput | number | null
    openingBalance?: FloatFieldUpdateOperationsInput | number
    transactions?: TransactionUncheckedUpdateManyWithoutPartyNestedInput
    ledgerEntries?: LedgerEntryUncheckedUpdateManyWithoutPartyNestedInput
  }

  export type VariantUpsertWithoutSuppliersInput = {
    update: XOR<VariantUpdateWithoutSuppliersInput, VariantUncheckedUpdateWithoutSuppliersInput>
    create: XOR<VariantCreateWithoutSuppliersInput, VariantUncheckedCreateWithoutSuppliersInput>
    where?: VariantWhereInput
  }

  export type VariantUpdateToOneWithWhereWithoutSuppliersInput = {
    where?: VariantWhereInput
    data: XOR<VariantUpdateWithoutSuppliersInput, VariantUncheckedUpdateWithoutSuppliersInput>
  }

  export type VariantUpdateWithoutSuppliersInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
    product?: ProductUpdateOneRequiredWithoutVariantsNestedInput
    stocks?: StockUpdateManyWithoutVariantNestedInput
    txnItems?: TransactionItemUpdateManyWithoutVariantNestedInput
  }

  export type VariantUncheckedUpdateWithoutSuppliersInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
    stocks?: StockUncheckedUpdateManyWithoutVariantNestedInput
    txnItems?: TransactionItemUncheckedUpdateManyWithoutVariantNestedInput
  }

  export type AuditLogCreateManyUserInput = {
    id?: string
    action: string
    entity: string
    entityId: string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type OutletUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
    warehouses?: WarehouseUpdateManyWithoutOutletsNestedInput
    stocks?: StockUpdateManyWithoutOutletNestedInput
  }

  export type OutletUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
    warehouses?: WarehouseUncheckedUpdateManyWithoutOutletsNestedInput
    stocks?: StockUncheckedUpdateManyWithoutOutletNestedInput
  }

  export type OutletUncheckedUpdateManyWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
  }

  export type AuditLogUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuditLogUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: StringFieldUpdateOperationsInput | string
    oldValues?: NullableJsonNullValueInput | InputJsonValue
    newValues?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockCreateManyWarehouseInput = {
    id?: string
    variantId: string
    outletId?: string | null
    quantity?: number
    inTransitQty?: number
  }

  export type OutletUpdateWithoutWarehousesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
    users?: UserUpdateManyWithoutOutletsNestedInput
    stocks?: StockUpdateManyWithoutOutletNestedInput
  }

  export type OutletUncheckedUpdateWithoutWarehousesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
    users?: UserUncheckedUpdateManyWithoutOutletsNestedInput
    stocks?: StockUncheckedUpdateManyWithoutOutletNestedInput
  }

  export type OutletUncheckedUpdateManyWithoutWarehousesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    invoicePrefix?: StringFieldUpdateOperationsInput | string
    gstin?: NullableStringFieldUpdateOperationsInput | string | null
    bankDetails?: NullableStringFieldUpdateOperationsInput | string | null
    negativeStockPolicy?: StringFieldUpdateOperationsInput | string
  }

  export type StockUpdateWithoutWarehouseInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
    variant?: VariantUpdateOneRequiredWithoutStocksNestedInput
    outlet?: OutletUpdateOneWithoutStocksNestedInput
  }

  export type StockUncheckedUpdateWithoutWarehouseInput = {
    id?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    outletId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
  }

  export type StockUncheckedUpdateManyWithoutWarehouseInput = {
    id?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    outletId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
  }

  export type StockCreateManyOutletInput = {
    id?: string
    variantId: string
    warehouseId?: string | null
    quantity?: number
    inTransitQty?: number
  }

  export type WarehouseUpdateWithoutOutletsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    stocks?: StockUpdateManyWithoutWarehouseNestedInput
  }

  export type WarehouseUncheckedUpdateWithoutOutletsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    stocks?: StockUncheckedUpdateManyWithoutWarehouseNestedInput
  }

  export type WarehouseUncheckedUpdateManyWithoutOutletsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUpdateWithoutOutletsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    actions?: AuditLogUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutOutletsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    actions?: AuditLogUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateManyWithoutOutletsInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StockUpdateWithoutOutletInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
    variant?: VariantUpdateOneRequiredWithoutStocksNestedInput
    warehouse?: WarehouseUpdateOneWithoutStocksNestedInput
  }

  export type StockUncheckedUpdateWithoutOutletInput = {
    id?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    warehouseId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
  }

  export type StockUncheckedUpdateManyWithoutOutletInput = {
    id?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    warehouseId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
  }

  export type CategoryCreateManyParentInput = {
    id?: string
    name: string
  }

  export type ProductCreateManyCategoryInput = {
    id?: string
    name: string
    brand?: string | null
    hsnCode: string
    gstRate: number
    baseUnit: string
    purchaseUnit?: string | null
    salesUnit?: string | null
    conversionRatio?: number | null
    isArchived?: boolean
  }

  export type CategoryUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    children?: CategoryUpdateManyWithoutParentNestedInput
    products?: ProductUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    children?: CategoryUncheckedUpdateManyWithoutParentNestedInput
    products?: ProductUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
  }

  export type ProductUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brand?: NullableStringFieldUpdateOperationsInput | string | null
    hsnCode?: StringFieldUpdateOperationsInput | string
    gstRate?: FloatFieldUpdateOperationsInput | number
    baseUnit?: StringFieldUpdateOperationsInput | string
    purchaseUnit?: NullableStringFieldUpdateOperationsInput | string | null
    salesUnit?: NullableStringFieldUpdateOperationsInput | string | null
    conversionRatio?: NullableFloatFieldUpdateOperationsInput | number | null
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    variants?: VariantUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brand?: NullableStringFieldUpdateOperationsInput | string | null
    hsnCode?: StringFieldUpdateOperationsInput | string
    gstRate?: FloatFieldUpdateOperationsInput | number
    baseUnit?: StringFieldUpdateOperationsInput | string
    purchaseUnit?: NullableStringFieldUpdateOperationsInput | string | null
    salesUnit?: NullableStringFieldUpdateOperationsInput | string | null
    conversionRatio?: NullableFloatFieldUpdateOperationsInput | number | null
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    variants?: VariantUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    brand?: NullableStringFieldUpdateOperationsInput | string | null
    hsnCode?: StringFieldUpdateOperationsInput | string
    gstRate?: FloatFieldUpdateOperationsInput | number
    baseUnit?: StringFieldUpdateOperationsInput | string
    purchaseUnit?: NullableStringFieldUpdateOperationsInput | string | null
    salesUnit?: NullableStringFieldUpdateOperationsInput | string | null
    conversionRatio?: NullableFloatFieldUpdateOperationsInput | number | null
    isArchived?: BoolFieldUpdateOperationsInput | boolean
  }

  export type VariantCreateManyProductInput = {
    id?: string
    sku: string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice: number
    sellingPrice: number
    pricingMethod?: string
    markupPercent?: number | null
    minStockLevel?: number
  }

  export type VariantUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
    stocks?: StockUpdateManyWithoutVariantNestedInput
    txnItems?: TransactionItemUpdateManyWithoutVariantNestedInput
    suppliers?: VendorProductUpdateManyWithoutVariantNestedInput
  }

  export type VariantUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
    stocks?: StockUncheckedUpdateManyWithoutVariantNestedInput
    txnItems?: TransactionItemUncheckedUpdateManyWithoutVariantNestedInput
    suppliers?: VendorProductUncheckedUpdateManyWithoutVariantNestedInput
  }

  export type VariantUncheckedUpdateManyWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    sku?: StringFieldUpdateOperationsInput | string
    specifications?: NullableJsonNullValueInput | InputJsonValue
    purchasePrice?: FloatFieldUpdateOperationsInput | number
    sellingPrice?: FloatFieldUpdateOperationsInput | number
    pricingMethod?: StringFieldUpdateOperationsInput | string
    markupPercent?: NullableFloatFieldUpdateOperationsInput | number | null
    minStockLevel?: FloatFieldUpdateOperationsInput | number
  }

  export type StockCreateManyVariantInput = {
    id?: string
    warehouseId?: string | null
    outletId?: string | null
    quantity?: number
    inTransitQty?: number
  }

  export type TransactionItemCreateManyVariantInput = {
    id?: string
    transactionId: string
    quantity: number
    rate: number
    freightFraction?: number | null
    taxableValue: number
    cgst?: number
    sgst?: number
    igst?: number
  }

  export type VendorProductCreateManyVariantInput = {
    id?: string
    vendorId: string
    lastPrice?: number | null
    leadTime?: number | null
  }

  export type StockUpdateWithoutVariantInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
    warehouse?: WarehouseUpdateOneWithoutStocksNestedInput
    outlet?: OutletUpdateOneWithoutStocksNestedInput
  }

  export type StockUncheckedUpdateWithoutVariantInput = {
    id?: StringFieldUpdateOperationsInput | string
    warehouseId?: NullableStringFieldUpdateOperationsInput | string | null
    outletId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
  }

  export type StockUncheckedUpdateManyWithoutVariantInput = {
    id?: StringFieldUpdateOperationsInput | string
    warehouseId?: NullableStringFieldUpdateOperationsInput | string | null
    outletId?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: FloatFieldUpdateOperationsInput | number
    inTransitQty?: FloatFieldUpdateOperationsInput | number
  }

  export type TransactionItemUpdateWithoutVariantInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    rate?: FloatFieldUpdateOperationsInput | number
    freightFraction?: NullableFloatFieldUpdateOperationsInput | number | null
    taxableValue?: FloatFieldUpdateOperationsInput | number
    cgst?: FloatFieldUpdateOperationsInput | number
    sgst?: FloatFieldUpdateOperationsInput | number
    igst?: FloatFieldUpdateOperationsInput | number
    transaction?: TransactionUpdateOneRequiredWithoutItemsNestedInput
  }

  export type TransactionItemUncheckedUpdateWithoutVariantInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    rate?: FloatFieldUpdateOperationsInput | number
    freightFraction?: NullableFloatFieldUpdateOperationsInput | number | null
    taxableValue?: FloatFieldUpdateOperationsInput | number
    cgst?: FloatFieldUpdateOperationsInput | number
    sgst?: FloatFieldUpdateOperationsInput | number
    igst?: FloatFieldUpdateOperationsInput | number
  }

  export type TransactionItemUncheckedUpdateManyWithoutVariantInput = {
    id?: StringFieldUpdateOperationsInput | string
    transactionId?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    rate?: FloatFieldUpdateOperationsInput | number
    freightFraction?: NullableFloatFieldUpdateOperationsInput | number | null
    taxableValue?: FloatFieldUpdateOperationsInput | number
    cgst?: FloatFieldUpdateOperationsInput | number
    sgst?: FloatFieldUpdateOperationsInput | number
    igst?: FloatFieldUpdateOperationsInput | number
  }

  export type VendorProductUpdateWithoutVariantInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    leadTime?: NullableIntFieldUpdateOperationsInput | number | null
    vendor?: PartyUpdateOneRequiredWithoutSuppliedProductsNestedInput
  }

  export type VendorProductUncheckedUpdateWithoutVariantInput = {
    id?: StringFieldUpdateOperationsInput | string
    vendorId?: StringFieldUpdateOperationsInput | string
    lastPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    leadTime?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type VendorProductUncheckedUpdateManyWithoutVariantInput = {
    id?: StringFieldUpdateOperationsInput | string
    vendorId?: StringFieldUpdateOperationsInput | string
    lastPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    leadTime?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type TransactionCreateManyPartyInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
    parentId?: string | null
  }

  export type LedgerEntryCreateManyPartyInput = {
    id?: string
    accountId: string
    transactionId?: string | null
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
  }

  export type VendorProductCreateManyVendorInput = {
    id?: string
    variantId: string
    lastPrice?: number | null
    leadTime?: number | null
  }

  export type TransactionUpdateWithoutPartyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    parent?: TransactionUpdateOneWithoutChildrenNestedInput
    children?: TransactionUpdateManyWithoutParentNestedInput
    items?: TransactionItemUpdateManyWithoutTransactionNestedInput
    ledgerEntries?: LedgerEntryUpdateManyWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateWithoutPartyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    children?: TransactionUncheckedUpdateManyWithoutParentNestedInput
    items?: TransactionItemUncheckedUpdateManyWithoutTransactionNestedInput
    ledgerEntries?: LedgerEntryUncheckedUpdateManyWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateManyWithoutPartyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LedgerEntryUpdateWithoutPartyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
    account?: AccountUpdateOneRequiredWithoutEntriesNestedInput
    transaction?: TransactionUpdateOneWithoutLedgerEntriesNestedInput
  }

  export type LedgerEntryUncheckedUpdateWithoutPartyInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LedgerEntryUncheckedUpdateManyWithoutPartyInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
  }

  export type VendorProductUpdateWithoutVendorInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    leadTime?: NullableIntFieldUpdateOperationsInput | number | null
    variant?: VariantUpdateOneRequiredWithoutSuppliersNestedInput
  }

  export type VendorProductUncheckedUpdateWithoutVendorInput = {
    id?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    lastPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    leadTime?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type VendorProductUncheckedUpdateManyWithoutVendorInput = {
    id?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    lastPrice?: NullableFloatFieldUpdateOperationsInput | number | null
    leadTime?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type TransactionCreateManyParentInput = {
    id?: string
    type: $Enums.TxType
    txnNumber: string
    date?: Date | string
    partyId?: string | null
    fromLocationId?: string | null
    toLocationId?: string | null
    totalTaxable?: number
    totalTax?: number
    freightCost?: number | null
    grandTotal?: number
    status?: string
  }

  export type TransactionItemCreateManyTransactionInput = {
    id?: string
    variantId: string
    quantity: number
    rate: number
    freightFraction?: number | null
    taxableValue: number
    cgst?: number
    sgst?: number
    igst?: number
  }

  export type LedgerEntryCreateManyTransactionInput = {
    id?: string
    accountId: string
    partyId?: string | null
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
  }

  export type TransactionUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    party?: PartyUpdateOneWithoutTransactionsNestedInput
    children?: TransactionUpdateManyWithoutParentNestedInput
    items?: TransactionItemUpdateManyWithoutTransactionNestedInput
    ledgerEntries?: LedgerEntryUpdateManyWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    children?: TransactionUncheckedUpdateManyWithoutParentNestedInput
    items?: TransactionItemUncheckedUpdateManyWithoutTransactionNestedInput
    ledgerEntries?: LedgerEntryUncheckedUpdateManyWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumTxTypeFieldUpdateOperationsInput | $Enums.TxType
    txnNumber?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    fromLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    toLocationId?: NullableStringFieldUpdateOperationsInput | string | null
    totalTaxable?: FloatFieldUpdateOperationsInput | number
    totalTax?: FloatFieldUpdateOperationsInput | number
    freightCost?: NullableFloatFieldUpdateOperationsInput | number | null
    grandTotal?: FloatFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
  }

  export type TransactionItemUpdateWithoutTransactionInput = {
    id?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    rate?: FloatFieldUpdateOperationsInput | number
    freightFraction?: NullableFloatFieldUpdateOperationsInput | number | null
    taxableValue?: FloatFieldUpdateOperationsInput | number
    cgst?: FloatFieldUpdateOperationsInput | number
    sgst?: FloatFieldUpdateOperationsInput | number
    igst?: FloatFieldUpdateOperationsInput | number
    variant?: VariantUpdateOneRequiredWithoutTxnItemsNestedInput
  }

  export type TransactionItemUncheckedUpdateWithoutTransactionInput = {
    id?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    rate?: FloatFieldUpdateOperationsInput | number
    freightFraction?: NullableFloatFieldUpdateOperationsInput | number | null
    taxableValue?: FloatFieldUpdateOperationsInput | number
    cgst?: FloatFieldUpdateOperationsInput | number
    sgst?: FloatFieldUpdateOperationsInput | number
    igst?: FloatFieldUpdateOperationsInput | number
  }

  export type TransactionItemUncheckedUpdateManyWithoutTransactionInput = {
    id?: StringFieldUpdateOperationsInput | string
    variantId?: StringFieldUpdateOperationsInput | string
    quantity?: FloatFieldUpdateOperationsInput | number
    rate?: FloatFieldUpdateOperationsInput | number
    freightFraction?: NullableFloatFieldUpdateOperationsInput | number | null
    taxableValue?: FloatFieldUpdateOperationsInput | number
    cgst?: FloatFieldUpdateOperationsInput | number
    sgst?: FloatFieldUpdateOperationsInput | number
    igst?: FloatFieldUpdateOperationsInput | number
  }

  export type LedgerEntryUpdateWithoutTransactionInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
    account?: AccountUpdateOneRequiredWithoutEntriesNestedInput
    party?: PartyUpdateOneWithoutLedgerEntriesNestedInput
  }

  export type LedgerEntryUncheckedUpdateWithoutTransactionInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LedgerEntryUncheckedUpdateManyWithoutTransactionInput = {
    id?: StringFieldUpdateOperationsInput | string
    accountId?: StringFieldUpdateOperationsInput | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LedgerEntryCreateManyAccountInput = {
    id?: string
    partyId?: string | null
    transactionId?: string | null
    date?: Date | string
    debit?: number
    credit?: number
    reference?: string | null
    isReconciled?: boolean
  }

  export type LedgerEntryUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
    party?: PartyUpdateOneWithoutLedgerEntriesNestedInput
    transaction?: TransactionUpdateOneWithoutLedgerEntriesNestedInput
  }

  export type LedgerEntryUncheckedUpdateWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
  }

  export type LedgerEntryUncheckedUpdateManyWithoutAccountInput = {
    id?: StringFieldUpdateOperationsInput | string
    partyId?: NullableStringFieldUpdateOperationsInput | string | null
    transactionId?: NullableStringFieldUpdateOperationsInput | string | null
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    debit?: FloatFieldUpdateOperationsInput | number
    credit?: FloatFieldUpdateOperationsInput | number
    reference?: NullableStringFieldUpdateOperationsInput | string | null
    isReconciled?: BoolFieldUpdateOperationsInput | boolean
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}