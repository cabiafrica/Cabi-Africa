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
        'senderRole': senderRole == MessageRole.passenger ? 'PASSENGER' : 'DRIVER',
        'text': text,
        'timestamp': timestamp.toIso8601String(),
      };

  factory TripChatMessage.fromJson(Map<String, dynamic> json, {required bool isMe}) {
    return TripChatMessage(
      id: json['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
      tripId: json['tripId']?.toString() ?? 'CABI-982',
      senderName: json['senderName']?.toString() ?? 'Captain',
      senderRole: json['senderRole'] == 'DRIVER' ? MessageRole.driver : MessageRole.passenger,
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
  MessageRole _myRole = MessageRole.passenger;
  String _myName = 'Sarah Jenkins';

  TripCommChannel? _channel;
  final List<TripChatMessage> _messages = [];

  VoipCallState _callState = VoipCallState.idle;
  String _peerName = 'James Mwangi';
  String _peerRole = 'DRIVER';
  String _peerVehicle = 'Toyota Axio • KDA 892J';
  String? _peerAvatar;
  int _callDurationSeconds = 0;
  Timer? _callDurationTimer;

  List<TripChatMessage> get messages => List.unmodifiable(_messages);
  VoipCallState get callState => _callState;
  String get peerName => _peerName;
  String get peerRole => _peerRole;
  String get peerVehicle => _peerVehicle;
  String? get peerAvatar => _peerAvatar;
  int get callDurationSeconds => _callDurationSeconds;

  void init({
    String tripId = 'CABI-982',
    MessageRole role = MessageRole.passenger,
    String myName = 'Sarah Jenkins',
    String peerName = 'James Mwangi',
    String peerVehicle = 'Toyota Axio • KDA 892J',
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
      // Add initial contextual prompt if empty
      _messages.add(
        TripChatMessage(
          id: 'sys_init',
          tripId: _tripId,
          senderName: 'Cabi Secure Trip Relay',
          senderRole: MessageRole.driver,
          text: 'Trip CABI-982 active. End-to-end encrypted captain messaging ready.',
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
      final isFromMe = (_myRole == MessageRole.passenger && roleStr == 'PASSENGER') ||
          (_myRole == MessageRole.driver && roleStr == 'DRIVER');

      // Only add if not from myself to prevent double appending
      if (!isFromMe) {
        final newMsg = TripChatMessage.fromJson(data, isMe: false);
        _messages.add(newMsg);
        notifyListeners();
      }
    } else if (type == 'CALL_START') {
      final callerRole = data['callerRole']?.toString();
      final isFromMe = (_myRole == MessageRole.passenger && callerRole == 'PASSENGER') ||
          (_myRole == MessageRole.driver && callerRole == 'DRIVER');

      if (!isFromMe) {
        _peerName = data['callerName']?.toString() ?? _peerName;
        _peerRole = callerRole ?? _peerRole;
        _peerAvatar = data['callerAvatar']?.toString() ?? _peerAvatar;
        _peerVehicle = data['vehicleInfo']?.toString() ?? _peerVehicle;
        _callState = VoipCallState.incomingRinging;
        notifyListeners();
      }
    } else if (type == 'CALL_ACCEPT') {
      if (_callState == VoipCallState.outgoingCalling) {
        _startCallTimer();
        _callState = VoipCallState.connected;
        notifyListeners();
      }
    } else if (type == 'CALL_DECLINE' || type == 'CALL_END') {
      _stopCallTimer();
      _callState = VoipCallState.ended;
      notifyListeners();
      Future.delayed(const Duration(seconds: 2), () {
        if (_callState == VoipCallState.ended) {
          _callState = VoipCallState.idle;
          notifyListeners();
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
    _callState = VoipCallState.outgoingCalling;
    _callDurationSeconds = 0;
    _channel?.postMessage({
      'type': 'CALL_START',
      'tripId': _tripId,
      'callerName': _myName,
      'callerRole': _myRole == MessageRole.passenger ? 'PASSENGER' : 'DRIVER',
      'callerAvatar': _peerAvatar,
      'vehicleInfo': _peerVehicle,
    });
    notifyListeners();
  }

  void acceptCall() {
    _startCallTimer();
    _callState = VoipCallState.connected;
    _channel?.postMessage({
      'type': 'CALL_ACCEPT',
      'tripId': _tripId,
    });
    notifyListeners();
  }

  void declineCall() {
    _stopCallTimer();
    _callState = VoipCallState.idle;
    _channel?.postMessage({
      'type': 'CALL_DECLINE',
      'tripId': _tripId,
    });
    notifyListeners();
  }

  void endCall() {
    _stopCallTimer();
    _callState = VoipCallState.ended;
    _channel?.postMessage({
      'type': 'CALL_END',
      'tripId': _tripId,
    });
    notifyListeners();
    Future.delayed(const Duration(seconds: 2), () {
      if (_callState == VoipCallState.ended) {
        _callState = VoipCallState.idle;
        notifyListeners();
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
    _channel?.dispose();
    super.dispose();
  }
}
