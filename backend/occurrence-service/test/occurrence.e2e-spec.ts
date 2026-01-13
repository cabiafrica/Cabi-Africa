import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Occurrence API (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/occurrences (POST)', () => {
        it('should create a new occurrence', () => {
            return request(app.getHttpServer())
                .post('/occurrences')
                .send({
                    category: 'TRAFFIC_OFFENSE',
                    severity: 'HIGH',
                    title: 'Reckless Driving',
                    description: 'Driver was speeding dangerously on the highway',
                    passengerId: 'test-passenger-id',
                    occurrenceDate: '2026-01-13',
                    occurrenceTime: '14:30',
                    location: {
                        lat: -1.2634,
                        lng: 36.8047,
                        city: 'Nairobi',
                    },
                    source: 'MANUAL',
                    registeredById: 'test-admin-id',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body).toHaveProperty('obNumber');
                    expect(res.body.obNumber).toMatch(/^OB-\d{4}-\d{6}$/);
                    expect(res.body.category).toBe('TRAFFIC_OFFENSE');
                    expect(res.body.severity).toBe('HIGH');
                });
        });

        it('should reject occurrence without involved party', () => {
            return request(app.getHttpServer())
                .post('/occurrences')
                .send({
                    category: 'TRAFFIC_OFFENSE',
                    severity: 'HIGH',
                    title: 'Test',
                    description: 'Test description',
                    occurrenceDate: '2026-01-13',
                    occurrenceTime: '14:30',
                    location: {},
                    source: 'MANUAL',
                    registeredById: 'test-admin-id',
                })
                .expect(400);
        });
    });

    describe('/occurrences (GET)', () => {
        it('should return list of occurrences with pagination', () => {
            return request(app.getHttpServer())
                .get('/occurrences?page=1&limit=10')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('data');
                    expect(res.body).toHaveProperty('meta');
                    expect(Array.isArray(res.body.data)).toBe(true);
                    expect(res.body.meta).toHaveProperty('total');
                    expect(res.body.meta).toHaveProperty('page');
                    expect(res.body.meta).toHaveProperty('limit');
                });
        });

        it('should filter occurrences by category', () => {
            return request(app.getHttpServer())
                .get('/occurrences?category=TRAFFIC_OFFENSE')
                .expect(200)
                .expect((res) => {
                    expect(res.body.data.every((occ: any) => occ.category === 'TRAFFIC_OFFENSE')).toBe(true);
                });
        });
    });

    describe('/occurrences/statistics (GET)', () => {
        it('should return occurrence statistics', () => {
            return request(app.getHttpServer())
                .get('/occurrences/statistics')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('total');
                    expect(res.body).toHaveProperty('byStatus');
                    expect(res.body).toHaveProperty('bySeverity');
                    expect(res.body).toHaveProperty('byCategory');
                });
        });
    });

    describe('/integrations/sos (POST)', () => {
        it('should create CRITICAL occurrence from SOS event', () => {
            return request(app.getHttpServer())
                .post('/integrations/sos')
                .send({
                    passengerId: 'test-passenger-id',
                    location: {
                        lat: -1.2634,
                        lng: 36.8047,
                        city: 'Nairobi',
                    },
                    timestamp: new Date().toISOString(),
                    userId: 'test-user-id',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body.success).toBe(true);
                    expect(res.body.occurrence).toHaveProperty('obNumber');
                    expect(res.body.occurrence.category).toBe('MEDICAL_EMERGENCY');
                    expect(res.body.occurrence.severity).toBe('CRITICAL');
                });
        });
    });

    describe('/objections (POST)', () => {
        it('should file an objection', async () => {
            // First create an occurrence
            const occurrenceRes = await request(app.getHttpServer())
                .post('/occurrences')
                .send({
                    category: 'TRAFFIC_OFFENSE',
                    severity: 'HIGH',
                    title: 'Test Occurrence',
                    description: 'Test description for objection',
                    passengerId: 'test-passenger-id',
                    occurrenceDate: '2026-01-13',
                    occurrenceTime: '14:30',
                    location: { city: 'Nairobi' },
                    source: 'MANUAL',
                    registeredById: 'test-admin-id',
                });

            const occurrenceId = occurrenceRes.body.id;

            // File objection
            return request(app.getHttpServer())
                .post('/objections')
                .send({
                    occurrenceId,
                    objectorId: 'test-passenger-id',
                    objectionText: 'This occurrence record is incorrect and unfair. I was not speeding.',
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.status).toBe('PENDING');
                    expect(res.body.objectionText).toContain('incorrect');
                });
        });
    });
});
