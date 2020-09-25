//  ---AEDWR
//  00000001 - only read - 1
//  00000010 - only write - 2
//  00000100 - only delete - 4
//  00001000 - only execute - 8
//  00010000 - only approve - 16
export enum Action {
  Read = 1,
  Write = 1 << 1,
  Delete = 1 << 2,
  Execute = 1 << 3,
  Approve = 1 << 4,
}

export enum SkipAuthorization {
  no = 0,
  yes = 1,
}
