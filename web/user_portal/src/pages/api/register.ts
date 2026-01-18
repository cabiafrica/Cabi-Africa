import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

const saveFile = async (file: formidable.File): Promise<string> => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalFilename || '');
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;
    const newPath = path.join(uploadDir, filename);

    // Copy file instead of rename to avoid cross-device link errors
    await fs.promises.copyFile(file.filepath, newPath);
    await fs.promises.unlink(file.filepath); // Remove temp file

    return `/uploads/${filename}`;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const form = formidable({});
        const [fields, files] = await form.parse(req);

        // Helper to get single value from fields
        const getValue = (key: string) => Array.isArray(fields[key]) ? fields[key]?.[0] : fields[key];

        const role = getValue('role');
        const firstName = getValue('firstName');
        const lastName = getValue('lastName');
        const middleName = getValue('middleName');
        const email = getValue('email');
        const phone = getValue('phone');
        const idNumber = getValue('idNumber');
        const password = getValue('password');
        const referralCode = getValue('referralCode');

        if (!role || !email || !password || !firstName || !lastName || !phone) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or phone already exists' });
        }

        // Validate Referral Code
        let referredById = null;
        if (referralCode) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode }
            });
            if (referrer) {
                referredById = referrer.id;
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`;
        const username = `${email.split('@')[0]}_${Math.floor(Math.random() * 10000)}`;
        const myReferralCode = (firstName.substring(0, 3) + Math.random().toString(36).substring(2, 7)).toUpperCase();

        if (role === 'passenger') {
            let passportPhotoUrl = null;
            if (files.passengerPhoto) {
                const photo = Array.isArray(files.passengerPhoto) ? files.passengerPhoto[0] : files.passengerPhoto;
                passportPhotoUrl = await saveFile(photo);
            }

            const newUser = await prisma.user.create({
                data: {
                    email,
                    phone,
                    password: hashedPassword,
                    fullName,
                    middleName,
                    idNumber,
                    username,
                    role: 'PASSENGER',
                    referralCode: myReferralCode,
                    referredById: referredById,
                    passportPhotoUrl
                }
            });
            // Mock Send Verification Email
            console.log(`[Mock Email Service] Sending Welcome/Verification Email to ${email} with subject: "Welcome to Cabi - Please Verify Your Email"`);
            // In a real implementation: await mailService.sendVerificationEmail(newUser);

            return res.status(201).json({
                success: true,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    role: newUser.role,
                    firstName: newUser.fullName.split(' ')[0],
                    lastName: newUser.fullName.split(' ').slice(1).join(' '),
                    profilePictureUrl: passportPhotoUrl
                }
            });
        }
        else if (role === 'driver') {
            const licenseNumber = getValue('licenseNumber');
            if (!licenseNumber) return res.status(400).json({ message: 'License number required for drivers' });

            const existingLicense = await prisma.driverProfile.findUnique({
                where: { licenseNumber }
            });
            if (existingLicense) {
                return res.status(400).json({ message: 'License number already registered' });
            }

            // Create User first
            const newUser = await prisma.user.create({
                data: {
                    email,
                    phone,
                    password: hashedPassword,
                    fullName,
                    middleName,
                    idNumber,
                    username,
                    role: 'DRIVER',
                    referralCode: myReferralCode,
                    referredById: referredById
                }
            });

            // Handle Documents
            const handleDoc = async (fileKey: string, docType: string) => {
                const file = files[fileKey];
                if (file) {
                    const f = Array.isArray(file) ? file[0] : file;
                    const url = await saveFile(f);
                    return {
                        type: docType,
                        url,
                        status: 'PENDING'
                    };
                }
                return null;
            };

            const documentsData = [];
            let profilePhotoUrl = null;

            const dlDoc = await handleDoc('drivingLicence', 'LICENSE_FRONT');
            if (dlDoc) documentsData.push(dlDoc);

            // Handle PSV Badge (Save as LICENSE_BACK for now if ENUM is restrictive, or check schema later)
            const psvDoc = await handleDoc('psvBadge', 'LICENSE_BACK');
            if (psvDoc) documentsData.push(psvDoc);

            const policeDoc = await handleDoc('policeClearance', 'POLICE_CLEARANCE');
            if (policeDoc) documentsData.push(policeDoc);

            const photoDoc = await handleDoc('driverPhoto', 'PROFILE_PHOTO');
            if (photoDoc) {
                documentsData.push(photoDoc);
                profilePhotoUrl = photoDoc.url;
            }

            // Create Driver Profile
            await prisma.driverProfile.create({
                data: {
                    userId: newUser.id,
                    licenseNumber,
                    isOnline: false,
                    documents: {
                        createMany: {
                            data: documentsData
                        }
                    }
                }
            });

            // Mock Send Verification Email
            console.log(`[Mock Email Service] Sending Welcome/Verification Email to ${email} with subject: "Welcome to Cabi Driver - Please Verify Your Email"`);

            return res.status(201).json({
                success: true,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    role: newUser.role,
                    firstName: newUser.fullName.split(' ')[0],
                    lastName: newUser.fullName.split(' ').slice(1).join(' '),
                    profilePictureUrl: profilePhotoUrl
                }
            });
        }
        else if (role === 'organization') {
            const orgName = getValue('orgName');
            const founderName = getValue('founderName');
            // Members
            const member1Name = getValue('member1Name');
            // ... extract others ...

            // Create User (Founder/Admin)
            const newUser = await prisma.user.create({
                data: {
                    email,
                    phone,
                    password: hashedPassword,
                    fullName,
                    middleName,
                    idNumber,
                    username,
                    role: 'ADMIN', // Giving ADMIN role for Org Manager
                    referralCode: myReferralCode
                }
            });

            // Handle Certificate
            let certUrl = null;
            if (files.registrationCertificate) {
                const f = Array.isArray(files.registrationCertificate) ? files.registrationCertificate[0] : files.registrationCertificate;
                certUrl = await saveFile(f);
            }

            // Create Organization
            const org = await prisma.organization.create({
                data: {
                    name: orgName,
                    founderName,
                    email: `${orgName.replace(/\s+/g, '').toLowerCase()}@cabi.com`, // Generate placeholder org email
                    registrationNumber: `ORG-${Date.now()}`, // Generate placeholder
                    registrationCertificateUrl: certUrl,
                    status: 'PENDING'
                }
            });

            // Add User as Organization Member
            await prisma.organizationMember.create({
                data: {
                    organizationId: org.id,
                    userId: newUser.id,
                    name: fullName,
                    contact: phone,
                    position: 'Founder',
                }
            });

            // Add other members (simplified for now - just as records if needed, or skip)
            if (member1Name) {
                await prisma.organizationMember.create({
                    data: {
                        organizationId: org.id,
                        name: member1Name,
                        contact: getValue('member1Phone') || '',
                        position: 'Member'
                    }
                });
            }
            // Repeat for mem2, mem3...

            // Mock Email
            console.log(`[Mock Email Service] Sending Organization Welcome Email to ${email}`);

            return res.status(201).json({
                success: true,
                user: {
                    id: newUser.id,
                    role: newUser.role,
                    firstName: newUser.fullName.split(' ')[0],
                    lastName: newUser.fullName.split(' ').slice(1).join(' '),
                    profilePictureUrl: null
                },
                org: { id: org.id }
            });
        }

        return res.status(400).json({ message: `Registration for role '${role}' is not supported via this endpoint yet.` });

    } catch (error: any) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}
