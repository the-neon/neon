enum QueryTypes {
  SELECT = "SELECT",
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  BULK_UPDATE = "BULKUPDATE",
  BULK_DELETE = "BULKDELETE",
  DELETE = "DELETE",
  UPSERT = "UPSERT",
  VERSION = "VERSION",
  SHOW_TABLES = "SHOWTABLES",
  SHOW_INDEXES = "SHOWINDEXES",
  DESCRIBE = "DESCRIBE",
  RAW = "RAW",
  FOREIGN_KEYS = "FOREIGNKEYS",
}

export default QueryTypes;