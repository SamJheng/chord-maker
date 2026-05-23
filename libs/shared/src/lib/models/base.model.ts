/**
 * 所有有時間戳記的 model 共用
 * @template TDate 前端 API 用 `string`（ISO 8601），後端 entity 用 `Date`
 */
export interface Timestamps<TDate = string> {
  createdAt: TDate;
  updatedAt: TDate;
}
