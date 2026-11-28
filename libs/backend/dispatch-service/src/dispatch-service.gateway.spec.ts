import * as jwt from 'jsonwebtoken';
import { DispatchGateway } from './dispatch-service.gateway';

describe('DispatchGateway WebSocket Security', () => {
  const secret = 'test-dispatch-secret';
  let gateway: DispatchGateway;
  let prisma: any;

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    prisma = {
      driverProfile: { update: jest.fn().mockResolvedValue({}) },
    };
    gateway = new DispatchGateway(prisma);
    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    } as any;
  });

  function mockSocket(token?: string) {
    return {
      id: 'sock-d1',
      data: {},
      handshake: { auth: token ? { token } : {}, headers: {} },
      join: jest.fn(),
      disconnect: jest.fn(),
    } as any;
  }

  it('disconnects unauthenticated clients on connect', () => {
    const sock = mockSocket();
    gateway.handleConnection(sock);
    expect(sock.disconnect).toHaveBeenCalledWith(true);
  });

  it('blocks non-dispatchers from joining dispatch-monitors room', () => {
    const sock = mockSocket(jwt.sign({ sub: 'drv-1', role: 'DRIVER' }, secret));
    gateway.handleConnection(sock);
    gateway.handleJoinDispatchMonitor(sock);
    expect(sock.join).not.toHaveBeenCalledWith('dispatch-monitors');
  });

  it('allows DISPATCHER to join dispatch-monitors room', () => {
    const sock = mockSocket(jwt.sign({ sub: 'disp-1', role: 'DISPATCHER' }, secret));
    gateway.handleConnection(sock);
    gateway.handleJoinDispatchMonitor(sock);
    expect(sock.join).toHaveBeenCalledWith('dispatch-monitors');
  });

  it('prevents driver A from spoofing driver B GPS location or taking them offline', async () => {
    const sock = mockSocket(jwt.sign({ sub: 'drv-A', driverProfileId: 'drv-A', role: 'DRIVER' }, secret));
    gateway.handleConnection(sock);

    await gateway.handleUpdateLocation(sock, { driverId: 'drv-B', lat: -1.29, lng: 36.82 });
    await gateway.handleDriverOffline(sock, 'drv-B');

    expect(prisma.driverProfile.update).not.toHaveBeenCalled();
  });

  it('allows driver A to update their own GPS location', async () => {
    const sock = mockSocket(jwt.sign({ sub: 'drv-A', driverProfileId: 'drv-A', role: 'DRIVER' }, secret));
    gateway.handleConnection(sock);

    await gateway.handleUpdateLocation(sock, { driverId: 'drv-A', lat: -1.29, lng: 36.82 });
    expect(prisma.driverProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'drv-A' } })
    );
  });
});
