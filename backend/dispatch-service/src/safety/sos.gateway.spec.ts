import * as jwt from 'jsonwebtoken';
import { SOSGateway } from './sos.gateway';

describe('SOSGateway Authentication & Scoped Broadcasts', () => {
  const secret = 'test-sos-secret';
  let gateway: SOSGateway;
  let roomEmit: jest.Mock;
  let globalEmit: jest.Mock;

  beforeEach(() => {
    process.env.JWT_SECRET = secret;
    gateway = new SOSGateway();
    roomEmit = jest.fn();
    globalEmit = jest.fn();
    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: roomEmit }),
      emit: globalEmit,
    } as any;
  });

  function mockSocket(token?: string) {
    return {
      id: 'sock-1',
      data: {},
      handshake: { auth: token ? { token } : {}, headers: {} },
      join: jest.fn(),
      disconnect: jest.fn(),
    } as any;
  }

  it('disconnects unauthenticated sockets on connect', () => {
    const sock = mockSocket();
    gateway.handleConnection(sock);
    expect(sock.disconnect).toHaveBeenCalledWith(true);
    expect(sock.join).not.toHaveBeenCalled();
  });

  it('ignores spoofed ADMIN role in registerClient payload for a PASSENGER token', () => {
    const token = jwt.sign({ sub: 'pass-1', role: 'PASSENGER' }, secret);
    const sock = mockSocket(token);
    gateway.handleConnection(sock);
    gateway.handleRegister(sock, { userId: 'victim-99', role: 'ADMIN' });

    expect(sock.join).toHaveBeenCalledWith('user_pass-1');
    expect(sock.join).not.toHaveBeenCalledWith('dispatch_ops_room');
    expect(sock.join).not.toHaveBeenCalledWith('user_victim-99');
  });

  it('scopes sendAlert to dispatch_ops_room and affected user room instead of global emit', () => {
    gateway.sendAlert({
      alertId: 'a1',
      occurrenceId: 'o1',
      obNumber: 'OB-1',
      userId: 'victim-1',
      userType: 'PASSENGER',
      location: { lat: -1.29, lng: 36.82 },
      tripId: 't1',
      timestamp: new Date(),
      status: 'OPEN',
      notifiedCaptainsCount: 2,
      goodSamaritanRewardPoints: 50,
      trackingUrl: 'https://cabi.africa/track/t1',
    });

    expect(globalEmit).not.toHaveBeenCalled();
    expect(gateway.server.to).toHaveBeenCalledWith('dispatch_ops_room');
    expect(gateway.server.to).toHaveBeenCalledWith('user_victim-1');
  });
});
