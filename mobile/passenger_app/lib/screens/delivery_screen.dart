import 'package:flutter/material.dart';

class DeliveryScreen extends StatefulWidget {
  const DeliveryScreen({super.key});

  @override
  State<DeliveryScreen> createState() => _DeliveryScreenState();
}

class _DeliveryScreenState extends State<DeliveryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _recipientNameController = TextEditingController();
  final _recipientPhoneController = TextEditingController();
  final _packageDescController = TextEditingController();

  String? _dropoffAddress;
  String _selectedSize = 'Small';

  final List<Map<String, dynamic>> _packageSizes = [
    {
      'title': 'Small',
      'desc': 'Fits in a backpack',
      'icon': Icons.inventory_2_outlined,
      'price': 'KES 150',
    },
    {
      'title': 'Medium',
      'desc': 'Fits on a bike',
      'icon': Icons.local_shipping_outlined,
      'price': 'KES 300',
    },
    {
      'title': 'Large',
      'desc': 'Fits in a car',
      'icon':
          Icons.conveyor_belt, // Using conveyor belt for large or custom icon
      'price': 'KES 500',
    },
  ];

  void _selectDropoff() {
    setState(() {
      _dropoffAddress = 'Industrial Area, Gate 4, Nairobi';
    });
  }

  void _bookDelivery() {
    if (_formKey.currentState!.validate() && _dropoffAddress != null) {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (ctx) => Container(
          height: MediaQuery.of(context).size.height * 0.4,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Icon(Icons.check_circle_rounded,
                  color: Colors.purple, size: 80),
              const SizedBox(height: 20),
              const Text(
                'Request Confirmed!',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              Text(
                'A delivery partner is being assigned to your location.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple.shade700,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15)),
                  ),
                  child: const Text('Track Package',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FE),
      appBar: AppBar(
        title: const Text('Send Package',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon:
              const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Location Timeline ──
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.purple.withValues(alpha: 0.05),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.circle,
                            color: Colors.purple, size: 14),
                        const SizedBox(width: 15),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Pickup Location',
                                  style: TextStyle(
                                      color: Colors.grey, fontSize: 12)),
                              Text('123 Westlands Ave, Nairobi',
                                  style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: const EdgeInsets.only(left: 6.0),
                      child: Container(
                          width: 2, height: 30, color: Colors.purple.shade100),
                    ),
                    InkWell(
                      onTap: _selectDropoff,
                      child: Row(
                        children: [
                          const Icon(Icons.location_on_rounded,
                              color: Colors.deepOrange, size: 18),
                          const SizedBox(width: 15),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Drop-off Location',
                                    style: TextStyle(
                                        color: Colors.grey, fontSize: 12)),
                                Text(
                                    _dropoffAddress ??
                                        'Where are you sending to?',
                                    style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                        color: _dropoffAddress == null
                                            ? Colors.grey
                                            : Colors.black)),
                              ],
                            ),
                          ),
                          const Icon(Icons.search_rounded,
                              color: Colors.purple),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              const Text('Package Size',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 15),
              SizedBox(
                height: 150,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _packageSizes.length,
                  itemBuilder: (context, index) {
                    final size = _packageSizes[index];
                    final isSelected = _selectedSize == size['title'];
                    return GestureDetector(
                      onTap: () =>
                          setState(() => _selectedSize = size['title']),
                      child: Container(
                        width: 130,
                        margin: const EdgeInsets.only(right: 15),
                        padding: const EdgeInsets.all(15),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? Colors.purple.shade700
                              : Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected
                                ? Colors.purple.shade700
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(size['icon'],
                                color:
                                    isSelected ? Colors.white : Colors.purple,
                                size: 30),
                            const Spacer(),
                            Text(size['title'],
                                style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: isSelected
                                        ? Colors.white
                                        : Colors.black)),
                            Text(size['price'],
                                style: TextStyle(
                                    fontSize: 12,
                                    color: isSelected
                                        ? Colors.white70
                                        : Colors.grey)),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 30),

              const Text('Recipient Details',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 15),
              TextFormField(
                controller: _recipientNameController,
                decoration: InputDecoration(
                  labelText: 'Recipient Name',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: BorderSide.none),
                  prefixIcon: const Icon(Icons.person_outline_rounded),
                ),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 15),
              TextFormField(
                controller: _recipientPhoneController,
                decoration: InputDecoration(
                  labelText: 'Phone Number',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: BorderSide.none),
                  prefixIcon: const Icon(Icons.phone_iphone_rounded),
                ),
                keyboardType: TextInputType.phone,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 15),
              TextFormField(
                controller: _packageDescController,
                decoration: InputDecoration(
                  labelText: 'What are you sending?',
                  hintText: 'e.g. Gift box, Keys...',
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(15),
                      borderSide: BorderSide.none),
                  prefixIcon: const Icon(Icons.description_outlined),
                ),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 40),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _bookDelivery,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple.shade700,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15)),
                    elevation: 5,
                    shadowColor: Colors.purple.withValues(alpha: 0.4),
                  ),
                  child: const Text('Confirm & Book Delivery',
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

