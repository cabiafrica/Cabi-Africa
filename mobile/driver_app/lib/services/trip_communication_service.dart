import 'dart:async';
import 'package:flutter/foundation.dart';
import 'trip_comm_channel/trip_comm_channel.dart';

enum MessageRole { passenger, driver }

enum VoipCallState {
  idle,
  outgoingCalling,
  incomingRinging,
  connected,
  ended,
}

class TripChatMessage {
  final String id;
  final String tripId;
  final String senderName;
  final MessageRole senderRole;
  final String text;
  final DateTime timestamp;
  final bool isMe;

  TripChatMessage({
    required this.id,
    required this.tripId,
    required this.senderName,
    required this.senderRole,
    required this.text,
    required this.timestamp,
    required this.isMe,
  });

  Map<String, dynamic> toJson() => {
        'type': 'CHAT',
        'id': id,
        'tripId': tripId,
        'senderName': senderName,
        'senderRole': senderRole == MessageRole.driver ? 'DRIVER' : 'PASSENGER',
        'text': text,
        'timestamp': timestamp.toIso8601String(),
      };

  factory TripChatMessage.fromJson(Map<String, dynamic> json, {required bool isMe}) {
    return TripChatMessage(
      id: json['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
      tripId: json['tripId']?.toString() ?? 'CABI-982',
      senderName: json['senderName']?.toString() ?? 'Passenger',
      senderRole: json['senderRole'] == 'PASSENGER' ? MessageRole.passenger : MessageRole.driver,
      text: json['text']?.toString() ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'].toString()) ?? DateTime.now()
          : DateTime.now(),
      isMe: isMe,
    );
  }
}

class TripCommunicationService extends ChangeNotifier {
  static final TripCommunicationService instance = TripCommunicationService._internal();
  TripCommunicationService._internal();

  String _tripId = 'CABI-982';
  MessageRole _myRole = MessageRole.driver;
  String _myName = 'James Mwangi';

  TripCommChannel? _channel;
  final List<TripChatMessage> _messages = [];

  VoipCallState _callState = VoipCallState.idle;

  void _setCallState(VoipCallState newState) {
    _callState = newState;
    if (!_callStateController.isClosed) {
      _callStateController.add(newState);
    }
    notifyListeners();
  }
  String _peerName = 'Sarah Jenkins';
  String _peerRole = 'PASSENGER';
  String _peerVehicle = 'VIP Corporate Rider';
  String? _peerAvatar;
  int _callDurationSeconds = 0;
  Timer? _callDurationTimer;

  final StreamController<VoipCallState> _callStateController =
      StreamController<VoipCallState>.broadcast();

  List<TripChatMessage> get messages => List.unmodifiable(_messages);
  VoipCallState get callState => _callState;
  Stream<VoipCallState> get callStateStream => _callStateController.stream;
  String get peerName => _peerName;
  String get peerRole => _peerRole;
  String get peerVehicle => _peerVehicle;
  String? get peerAvatar => _peerAvatar;
  int get callDurationSeconds => _callDurationSeconds;

  void init({
    String tripId = 'CABI-982',
    MessageRole role = MessageRole.driver,
    String myName = 'James Mwangi',
    String peerName = 'Sarah Jenkins',
    String peerVehicle = 'VIP Corporate Rider',
    String? peerAvatar,
  }) {
    _tripId = tripId;
    _myRole = role;
    _myName = myName;
    _peerName = peerName;
    _peerVehicle = peerVehicle;
    _peerAvatar = peerAvatar;

    _channel?.dispose();
    _channel = TripCommChannel(_tripId);
    _channel?.onMessageReceived = _handleIncomingMessage;

    if (_messages.isEmpty) {
      _messages.add(
        TripChatMessage(
          id: 'sys_init',
          tripId: _tripId,
          senderName: 'Cabi Secure Trip Relay',
          senderRole: MessageRole.passenger,
          text: 'Trip CABI-982 dispatch active. Secure messaging open with passenger.',
          timestamp: DateTime.now().subtract(const Duration(minutes: 2)),
          isMe: false,
        ),
      );
    }
    notifyListeners();
  }

  void _handleIncomingMessage(Map<String, dynamic> data) {
    final type = data['type']?.toString();
    if (type == 'CHAT') {
      final roleStr = data['senderRole']?.toString();
      final isFromMe = (_myRole == MessageRole.driver && roleStr == 'DRIVER') ||
          (_myRole == MessageRole.passenger && roleStr == 'PASSENGER');

      if (!isFromMe) {
        final newMsg = TripChatMessage.fromJson(data, isMe: false);
        _messages.add(newMsg);
        notifyListeners();
      }
    } else if (type == 'CALL_START') {
      final callerRole = data['callerRole']?.toString();
      final isFromMe = (_myRole == MessageRole.driver && callerRole == 'DRIVER') ||
          (_myRole == MessageRole.passenger && callerRole == 'PASSENGER');

      if (!isFromMe) {
        _peerName = data['callerName']?.toString() ?? _peerName;
        _peerRole = callerRole ?? _peerRole;
        _peerAvatar = data['callerAvatar']?.toString() ?? _peerAvatar;
        _peerVehicle = data['vehicleInfo']?.toString() ?? _peerVehicle;
        _setCallState(VoipCallState.incomingRinging);
      }
    } else if (type == 'CALL_ACCEPT') {
      if (_callState == VoipCallState.outgoingCalling) {
        _startCallTimer();
        _setCallState(VoipCallState.connected);
      }
    } else if (type == 'CALL_DECLINE' || type == 'CALL_END') {
      _stopCallTimer();
      _setCallState(VoipCallState.ended);
      Future.delayed(const Duration(seconds: 2), () {
        if (_callState == VoipCallState.ended) {
          _setCallState(VoipCallState.idle);
        }
      });
    }
  }

  void sendMessage(String text) {
    if (text.trim().isEmpty) return;
    final now = DateTime.now();
    final msg = TripChatMessage(
      id: now.millisecondsSinceEpoch.toString(),
      tripId: _tripId,
      senderName: _myName,
      senderRole: _myRole,
      text: text.trim(),
      timestamp: now,
      isMe: true,
    );

    _messages.add(msg);
    _channel?.postMessage(msg.toJson());
    notifyListeners();
  }

  void startCall() {
    _setCallState(VoipCallState.outgoingCalling);
    _callDurationSeconds = 0;
    _channel?.postMessage({
      'type': 'CALL_START',
      'tripId': _tripId,
      'callerName': _myName,
      'callerRole': _myRole == MessageRole.driver ? 'DRIVER' : 'PASSENGER',
      'callerAvatar': _peerAvatar,
      'vehicleInfo': _peerVehicle,
    });
  }

  void acceptCall() {
    _startCallTimer();
    _setCallState(VoipCallState.connected);
    _channel?.postMessage({
      'type': 'CALL_ACCEPT',
      'tripId': _tripId,
    });
  }

  void declineCall() {
    _stopCallTimer();
    _setCallState(VoipCallState.idle);
    _channel?.postMessage({
      'type': 'CALL_DECLINE',
      'tripId': _tripId,
    });
  }

  void endCall() {
    _stopCallTimer();
    _setCallState(VoipCallState.ended);
    _channel?.postMessage({
      'type': 'CALL_END',
      'tripId': _tripId,
    });
    Future.delayed(const Duration(seconds: 2), () {
      if (_callState == VoipCallState.ended) {
        _setCallState(VoipCallState.idle);
      }
    });
  }

  void _startCallTimer() {
    _callDurationTimer?.cancel();
    _callDurationSeconds = 0;
    _callDurationTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _callDurationSeconds++;
      notifyListeners();
    });
  }

  void _stopCallTimer() {
    _callDurationTimer?.cancel();
    _callDurationTimer = null;
  }

  @override
  void dispose() {
    _stopCallTimer();
    _callStateController.close();
    _channel?.dispose();
    super.dispose();
  }
}
