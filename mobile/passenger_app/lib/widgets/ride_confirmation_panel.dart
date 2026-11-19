import 'package:flutter/material.dart';
import 'corporate_billing_selector.dart';

class RideConfirmationPanel extends StatefulWidget {
  final String pickupAddress;
  final String destinationAddress;
  final double estimatedFare;
  final VoidCallback onConfirm;
  final VoidCallback onCancel;
  final Function({
    required bool isCorporate,
    String? accountId,
    String? costCenterId,
    String? purpose,
  })? onBillingProfileChanged;

  const RideConfirmationPanel({
    super.key,
    required this.pickupAddress,
    required this.destinationAddress,
    required this.estimatedFare,
    required this.onConfirm,
    required this.onCancel,
    this.onBillingProfileChanged,
  });

  @override
  State<RideConfirmationPanel> createState() => _RideConfirmationPanelState();
}

class _RideConfirmationPanelState extends State<RideConfirmationPanel> {
  static const Color _cabiGreen = Color(0xFF00A859);
  static const Color _darkCharcoal = Color(0xFF1E2022);

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Material(
        elevation: 12,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              Row(
                children: [
                  const Text(
                    'Est. Fare:',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: _darkCharcoal,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    'KES ${widget.estimatedFare.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: _cabiGreen,
                    ),
                  ),
                ],
              ),
              const Divider(height: 18),

              ListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.my_location, color: _cabiGreen, size: 20),
                title: const Text('Pickup', style: TextStyle(fontSize: 12, color: Colors.grey)),
                subtitle: Text(
                  widget.pickupAddress,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              ListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.location_on, color: Colors.redAccent, size: 20),
                title: const Text('Destination', style: TextStyle(fontSize: 12, color: Colors.grey)),
                subtitle: Text(
                  widget.destinationAddress,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  overflow: TextOverflow.ellipsis,
                ),
              ),

              // Corporate Billing Selector
              CorporateBillingSelector(
                estimatedFare: widget.estimatedFare,
                onChanged: ({
                  required bool isCorporate,
                  String? accountId,
                  String? costCenterId,
                  String? purpose,
                }) {
                  if (widget.onBillingProfileChanged != null) {
                    widget.onBillingProfileChanged!(
                      isCorporate: isCorporate,
                      accountId: accountId,
                      costCenterId: costCenterId,
                      purpose: purpose,
                    );
                  }
                },
              ),

              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: widget.onCancel,
                      child: const Text('Cancel', style: TextStyle(fontSize: 14)),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _cabiGreen,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: widget.onConfirm,
                      child: const Text(
                        'Confirm Ride',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
