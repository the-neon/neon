interface RequestContext {
  token: string;
}

interface RequestConfig {
  context: RequestContext;
}

export { RequestContext, RequestConfig };
