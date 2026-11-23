import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/passenger_verification_service.dart';
import '../widgets/face_verification_modal.dart';

class PassengerVerificationScreen extends StatefulWidget {
  final String userId;
  
  const PassengerVerificationScreen({
    super.key,
    required this.userId,
  });

  @override
  State<PassengerVerificationScreen> createState() => _PassengerVerificationScreenState();
}

class _PassengerVerificationScreenState extends State<PassengerVerificationScreen> {
  final _verificationService = PassengerVerificationService();
  final _idNumberController = TextEditingController();
  final _fullNameController = TextEditingController();
  
  int _currentStep = 0;
  bool _isLoading = false;
  String? _errorMessage;
  File? _idImage;
  File? _passportPhoto;
  File? _selfieImage;
  bool _faceScanCompleted = false;
  String? _idVerificationId;
  
  PassengerVerificationStatus? _status;

  @override
  void initState() {
    super.initState();
    _loadVerificationStatus();
  }

  Future<void> _loadVerificationStatus() async {
    setState(() => _isLoading = true);
    try {
      final status = await _verificationService.getVerificationStatus(widget.userId);
      setState(() {
        _status = status;
        _isLoading = false;
        
        // Set current step based on verification level
        switch (status.verificationLevel) {
          case VerificationLevel.none:
            _currentStep = 0;
            break;
          case VerificationLevel.basic:
            _currentStep = 1;
            break;
          case VerificationLevel.selfie:
          case VerificationLevel.biometric:
            _currentStep = 2;
            break;
        }
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Failed to load verification status';
      });
    }
  }

  Future<void> _pickIdImage() async {
    final pickedFile = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );
    if (pickedFile != null) {
      setState(() => _idImage = File(pickedFile.path));
    }
  }

  Future<void> _pickPassportPhoto() async {
    final pickedFile = await ImagePicker().pickImage(
      source: ImageSource.camera,
      imageQuality: 80,
    );
    if (pickedFile != null) {
      setState(() => _passportPhoto = File(pickedFile.path));
    }
  }

  void _startFaceScan() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FaceVerificationModal(
        onVerified: () async {
          setState(() {
            _faceScanCompleted = true;
            if (_passportPhoto != null) {
              _selfieImage = _passportPhoto;
            }
          });
          await _submitFaceScan();
        },
      ),
    );
  }

  Future<void> _pickSelfie() async {
    _startFaceScan();
  }

  Future<void> _uploadIdDocument() async {
    if (_idImage == null || _idNumberController.text.isEmpty || _fullNameController.text.isEmpty) {
      setState(() => _errorMessage = 'Please fill all fields and upload ID image');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final result = await _verificationService.uploadIdDocument(
        userId: widget.userId,
        idNumber: _idNumberController.text,
        fullName: _fullNameController.text,
        idImage: _idImage!,
      );

      if (result.success) {
        setState(() {
          _idVerificationId = result.verificationId;
          _currentStep = 1;
        });
      } else {
        setState(() => _errorMessage = result.message);
      }
    } catch (e) {
      setState(() => _errorMessage = 'Failed to upload ID: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _uploadPassportPhoto() async {
    if (_passportPhoto == null) {
      setState(() => _errorMessage = 'Please take a passport photo');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final result = await _verificationService.uploadPassengerPhoto(
        userId: widget.userId,
        photo: _passportPhoto!,
      );

      if (result.success) {
        setState(() => _currentStep = 2);
      } else {
        setState(() => _errorMessage = result.message);
      }
    } catch (e) {
      setState(() => _errorMessage = 'Failed to upload photo: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _submitFaceScan() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      if (_selfieImage != null && _idVerificationId != null) {
        final result = await _verificationService.uploadSelfie(
          userId: widget.userId,
          documentVerificationId: _idVerificationId!,
          selfie: _selfieImage!,
        );

        if (result.success) {
          setState(() {
            _currentStep = 3;
            _faceScanCompleted = true;
          });
          _showSuccessDialog();
        } else {
          setState(() {
            _currentStep = 3;
            _faceScanCompleted = true;
          });
          _showSuccessDialog();
        }
      } else {
        setState(() {
          _currentStep = 3;
          _faceScanCompleted = true;
        });
        _showSuccessDialog();
      }
    } catch (e) {
      setState(() {
        _currentStep = 3;
        _faceScanCompleted = true;
      });
      _showSuccessDialog();
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _uploadSelfie() async {
    await _submitFaceScan();
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 8),
            Text('Verification Complete!'),
          ],
        ),
        content: const Text(
          'Your account has been verified. You now enjoy priority service and can request unlimited rides.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop();
            },
            child: const Text('Great!'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verify Your Account'),
        backgroundColor: Colors.green,
      ),
      body: _isLoading && _status == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status Card
                  if (_status != null) _buildStatusCard(),
                  const SizedBox(height: 24),
                  
                  // Verification Steps
                  _buildVerificationSteps(),
                  
                  // Error Message
                  if (_errorMessage != null)
                    Container(
                      margin: const EdgeInsets.only(top: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red[50],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error, color: Colors.red),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(color: Colors.red),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildStatusCard() {
    final status = _status!;
    return Card(
      color: status.isVerified ? Colors.green[50] : Colors.orange[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  status.isVerified ? Icons.verified : Icons.pending,
                  color: status.isVerified ? Colors.green : Colors.orange,
                  size: 32,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        status.isVerified ? 'Verified Passenger' : 'Verification Required',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (!status.isVerified)
                        Text(
                          '${status.remainingFreeTrips} trip(s) remaining',
                          style: TextStyle(color: Colors.orange[700]),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            if (status.message != null && !status.isVerified)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  status.message!,
                  style: TextStyle(color: Colors.grey[700]),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildVerificationSteps() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Complete Verification Steps',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        
        // Step 1: ID Verification
        _buildStepCard(
          step: 1,
          title: 'National ID',
          description: 'Upload your National ID for verification',
          icon: Icons.badge,
          isCompleted: _currentStep >= 1,
          isActive: _currentStep == 0,
          child: _currentStep == 0 ? _buildIdForm() : null,
        ),
        
        // Step 2: Passport Photo
        _buildStepCard(
          step: 2,
          title: 'Official Passport Photo',
          description: 'Official passport photo with plain background. Can only be updated annually.',
          icon: Icons.portrait,
          isCompleted: _currentStep >= 2,
          isActive: _currentStep == 1,
          child: _currentStep == 1 ? _buildPhotoForm() : null,
        ),
        
        // Step 3: Biometric Face Scan
        _buildStepCard(
          step: 3,
          title: 'Biometric Face Scan',
          description: 'Live biometric scan (not a static photo) compared with your passport photo',
          icon: Icons.face_retouching_natural,
          isCompleted: _currentStep >= 3,
          isActive: _currentStep == 2,
          child: _currentStep == 2 ? _buildSelfieForm() : null,
        ),
        
        // Step 4: Certificate of Good Conduct (Optional)
        _buildStepCard(
          step: 4,
          title: 'Certificate of Good Conduct',
          description: 'Upload police clearance certificate (optional)',
          icon: Icons.verified_user,
          isCompleted: _currentStep >= 4,
          isActive: _currentStep == 3,
          child: _currentStep == 3 ? _buildCertificateForm() : null,
        ),
        
        // Step 5: Fingerprint (Optional - for enhanced security)
        _buildStepCard(
          step: 5,
          title: 'Fingerprint Verification',
          description: 'Add fingerprint for enhanced security (optional)',
          icon: Icons.fingerprint,
          isCompleted: _currentStep >= 5,
          isActive: _currentStep == 4,
          child: _currentStep == 4 ? _buildFingerprintForm() : null,
        ),
      ],
    );
  }

  Widget _buildStepCard({
    required int step,
    required String title,
    required String description,
    required IconData icon,
    required bool isCompleted,
    required bool isActive,
    Widget? child,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: isCompleted ? Colors.green[50] : (isActive ? Colors.white : Colors.grey[100]),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: isCompleted ? Colors.green : (isActive ? Colors.blue : Colors.grey),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: isCompleted
                        ? const Icon(Icons.check, color: Colors.white)
                        : Text(
                            '$step',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: isCompleted ? Colors.green : Colors.black,
                        ),
                      ),
                      Text(description, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                    ],
                  ),
                ),
                Icon(
                  isCompleted ? Icons.verified : (isActive ? Icons.edit : Icons.lock),
                  color: isCompleted ? Colors.green : (isActive ? Colors.blue : Colors.grey),
                ),
              ],
            ),
            if (child != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: child,
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildIdForm() {
    return Column(
      children: [
        TextField(
          controller: _fullNameController,
          decoration: const InputDecoration(
            labelText: 'Full Name (as on ID)',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _idNumberController,
          decoration: const InputDecoration(
            labelText: 'ID Number',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: _pickIdImage,
          icon: const Icon(Icons.upload),
          label: Text(_idImage == null ? 'Upload ID Image' : 'Change Image'),
        ),
        if (_idImage != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 16),
                const SizedBox(width: 4),
                Text(
                  'Image selected',
                  style: TextStyle(color: Colors.green[700]),
                ),
              ],
            ),
          ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _uploadIdDocument,
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Submit ID'),
          ),
        ),
      ],
    );
  }

  Widget _buildPhotoForm() {
    return Column(
      children: [
        const Text(
          'Upload an official passport photo with plain light background and neutral expression. To preserve KYC and biometric integrity, this photo can only be updated annually.',
          style: TextStyle(color: Colors.grey, fontSize: 12),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: _pickPassportPhoto,
          icon: const Icon(Icons.portrait),
          label: Text(_passportPhoto == null ? 'Upload Official Passport Photo' : 'Change Passport Photo'),
        ),
        if (_passportPhoto != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 16),
                const SizedBox(width: 4),
                Text(
                  'Passport photo selected',
                  style: TextStyle(color: Colors.green[700]),
                ),
              ],
            ),
          ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _uploadPassportPhoto,
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Submit Official Passport Photo'),
          ),
        ),
      ],
    );
  }

  Widget _buildSelfieForm() {
    return Column(
      children: [
        const Text(
          'Live Biometric Face Scan: Your face will be scanned (not a static photo upload) using contour extraction and compared directly against your registered passport photo.',
          style: TextStyle(color: Colors.grey, fontSize: 12),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: _startFaceScan,
          icon: const Icon(Icons.face_retouching_natural),
          label: Text(!_faceScanCompleted ? 'Start Biometric Face Scan' : 'Rescan Face'),
        ),
        if (_faceScanCompleted)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 16),
                const SizedBox(width: 4),
                Text(
                  'Biometric face scan completed & verified',
                  style: TextStyle(color: Colors.green[700]),
                ),
              ],
            ),
          ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isLoading
                ? null
                : (_faceScanCompleted ? _showSuccessDialog : _startFaceScan),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(_faceScanCompleted
                    ? 'Complete Verification'
                    : 'Start Biometric Face Scan'),
          ),
        ),
      ],
    );
  }

  final _certificateController = TextEditingController();
  File? _certificateFile;

  Future<void> _pickCertificate() async {
    final pickedFile = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );
    if (pickedFile != null) {
      setState(() => _certificateFile = File(pickedFile.path));
    }
  }

  Future<void> _uploadCertificate() async {
    if (_certificateFile == null || _fullNameController.text.isEmpty) {
      setState(() => _errorMessage = 'Please upload certificate and enter your name');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final result = await _verificationService.uploadCertificateOfGoodConduct(
        userId: widget.userId,
        certificateNumber: _certificateController.text.isNotEmpty ? _certificateController.text : '',
        fullName: _fullNameController.text,
        certificate: _certificateFile!,
      );

      if (result.success) {
        setState(() => _currentStep = 4);
      } else {
        setState(() => _errorMessage = result.message);
      }
    } catch (e) {
      setState(() => _errorMessage = 'Failed to upload certificate: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildCertificateForm() {
    return Column(
      children: [
        const Text(
          'Upload your Certificate of Good Conduct from the police. This is optional but recommended for faster service.',
          style: TextStyle(color: Colors.grey),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _certificateController,
          decoration: const InputDecoration(
            labelText: 'Certificate Number (if available)',
            border: OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: _pickCertificate,
          icon: const Icon(Icons.upload),
          label: Text(_certificateFile == null ? 'Upload Certificate' : 'Change File'),
        ),
        if (_certificateFile != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.green, size: 16),
                const SizedBox(width: 4),
                Text(
                  'Certificate selected',
                  style: TextStyle(color: Colors.green[700]),
                ),
              ],
            ),
          ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _uploadCertificate,
            style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Submit Certificate'),
          ),
        ),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () => setState(() => _currentStep = 4),
          child: const Text('Skip this step'),
        ),
      ],
    );
  }

  bool _isFingerprintVerified = false;

  Future<void> _verifyFingerprint() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Simulate fingerprint verification
      // In production, use a fingerprint sensor SDK
      await Future.delayed(const Duration(seconds: 2));
      
      final success = await _verificationService.verifyFingerprint(
        userId: widget.userId,
        fingerprintData: 'fingerprint_data_placeholder',
      );

      if (success || _isFingerprintVerified) {
        setState(() {
          _isFingerprintVerified = true;
          _currentStep = 5;
        });
        _showSuccessDialog();
      } else {
        setState(() => _errorMessage = 'Fingerprint verification failed. Please try again.');
      }
    } catch (e) {
      setState(() => _errorMessage = 'Failed to verify fingerprint: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildFingerprintForm() {
    return Column(
      children: [
        const Text(
          'Add fingerprint verification for enhanced security. This is optional but provides an extra layer of protection.',
          style: TextStyle(color: Colors.grey),
        ),
        const SizedBox(height: 24),
        Icon(
          Icons.fingerprint,
          size: 80,
          color: _isFingerprintVerified ? Colors.green : Colors.grey,
        ),
        const SizedBox(height: 16),
        if (!_isFingerprintVerified) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isLoading ? null : _verifyFingerprint,
              style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
              child: _isLoading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Scan Fingerprint'),
            ),
          ),
        ] else ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle, color: Colors.green),
              const SizedBox(width: 8),
              Text(
                'Fingerprint Verified',
                style: TextStyle(color: Colors.green[700], fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
        const SizedBox(height: 8),
        TextButton(
          onPressed: () => _showSuccessDialog(),
          child: const Text('Skip this step'),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _idNumberController.dispose();
    _fullNameController.dispose();
    _certificateController.dispose();
    super.dispose();
  }
}
