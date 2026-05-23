import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

// ── Mock ArgumentsHost ──────────────────────────────────────
function createMockHost(method = 'GET', url = '/api/test') {
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const mockRes = { status: mockStatus };
  const mockReq = { method, url };

  const host = {
    switchToHttp: () => ({
      getRequest: () => mockReq,
      getResponse: () => mockRes,
    }),
  } as unknown as ArgumentsHost;

  return { host, mockStatus, mockJson };
}

// ── Tests ───────────────────────────────────────────────────
describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  it('HttpException → 正確的 statusCode 與 message', () => {
    const { host, mockStatus, mockJson } = createMockHost();
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404, path: '/api/test' }),
    );
  });

  it('未知錯誤 → 回傳 500', () => {
    const { host, mockStatus } = createMockHost();
    filter.catch(new Error('something went wrong'), host);
    expect(mockStatus).toHaveBeenCalledWith(500);
  });

  it('回傳物件包含 timestamp 與 path', () => {
    const { host, mockJson } = createMockHost('POST', '/api/songs');
    filter.catch(new HttpException('Bad Request', 400), host);

    const payload = mockJson.mock.calls[0][0];
    expect(payload).toHaveProperty('timestamp');
    expect(payload.path).toBe('/api/songs');
  });

  it('非 HttpException 的 message 為 Internal server error', () => {
    const { host, mockJson } = createMockHost();
    filter.catch(new TypeError('oops'), host);

    const payload = mockJson.mock.calls[0][0];
    expect(payload.message).toBe('Internal server error');
  });
});
