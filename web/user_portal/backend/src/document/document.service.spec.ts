import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentService],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findExpiring', () => {
    it('should find documents expiring within the default 30 days', async () => {
      const expiringDocs = await service.findExpiring();

      // From mock data, doc-1 (10 days) and doc-2 (25 days) should be found.
      // doc-3 (60 days) and doc-4 (expired) should not.
      expect(expiringDocs).toHaveLength(2);
      expect(expiringDocs.map(d => d.id)).toEqual(['doc-1', 'doc-2']);
    });

    it('should return documents sorted by the soonest expiry date', async () => {
      const expiringDocs = await service.findExpiring();

      // doc-1 expires in 10 days, doc-2 in 25 days. doc-1 should be first.
      expect(expiringDocs[0].id).toBe('doc-1');
      expect(expiringDocs[1].id).toBe('doc-2');
    });

    it('should not include documents that have already expired', async () => {
      const expiringDocs = await service.findExpiring();
      // doc-4 is expired and should not be in the list.
      expect(expiringDocs.find(d => d.id === 'doc-4')).toBeUndefined();
    });

    it('should use the custom `days` parameter when provided', async () => {
      // With a 90-day window, doc-3 (60 days) should now be included.
      const expiringDocs = await service.findExpiring(90);
      expect(expiringDocs).toHaveLength(3);
      expect(expiringDocs.map(d => d.id)).toEqual(['doc-1', 'doc-2', 'doc-3']);
    });
  });
});