import 'package:flutter/material.dart';

class PickupNotesWidget extends StatefulWidget {
  final Function(String) onNoteChanged;
  final String? initialNote;

  const PickupNotesWidget({
    super.key,
    required this.onNoteChanged,
    this.initialNote,
  });

  @override
  State<PickupNotesWidget> createState() => _PickupNotesWidgetState();
}

class _PickupNotesWidgetState extends State<PickupNotesWidget> {
  late TextEditingController _controller;
  bool _isExpanded = false;

  final List<String> _quickNotes = [
    'I\'m at the main entrance',
    'Blue door',
    'Side entrance',
    'Meet at parking lot',
    'I\'ll be outside',
  ];

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialNote ?? '');
    _isExpanded = widget.initialNote != null && widget.initialNote!.isNotEmpty;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            leading: Icon(
              Icons.note_add,
              color: _isExpanded ? Colors.blue : Colors.grey.shade600,
            ),
            title: Text(
              _isExpanded ? 'Pickup Note' : 'Add pickup note (optional)',
              style: TextStyle(
                fontWeight: _isExpanded ? FontWeight.bold : FontWeight.normal,
              ),
            ),
            subtitle: _isExpanded && _controller.text.isEmpty
                ? const Text('Help your driver find you easily')
                : null,
            trailing: IconButton(
              icon: Icon(_isExpanded ? Icons.expand_less : Icons.expand_more),
              onPressed: () {
                setState(() => _isExpanded = !_isExpanded);
              },
            ),
          ),
          
          if (_isExpanded) ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    controller: _controller,
                    maxLength: 100,
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'e.g., "I\'m at the blue door"',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      filled: true,
                      fillColor: Colors.grey.shade50,
                      counterText: '${_controller.text.length}/100',
                    ),
                    onChanged: (value) {
                      setState(() {});
                      widget.onNoteChanged(value);
                    },
                  ),
                  
                  const SizedBox(height: 12),
                  
                  // Quick notes
                  Text(
                    'Quick notes:',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey.shade600,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _quickNotes.map((note) => GestureDetector(
                      onTap: () {
                        setState(() {
                          _controller.text = note;
                        });
                        widget.onNoteChanged(note);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: _controller.text == note
                              ? Colors.blue.shade100
                              : Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: _controller.text == note
                                ? Colors.blue
                                : Colors.transparent,
                          ),
                        ),
                        child: Text(
                          note,
                          style: TextStyle(
                            fontSize: 12,
                            color: _controller.text == note
                                ? Colors.blue.shade700
                                : Colors.grey.shade700,
                          ),
                        ),
                      ),
                    )).toList(),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
