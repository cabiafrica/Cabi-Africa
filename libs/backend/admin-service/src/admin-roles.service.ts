import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

/**
 * Service handling role CRUD operations. Currently uses in‑memory storage for simplicity.
 */
@Injectable()
export class AdminRolesService {
    private roles: any[] = [];

    findAll() {
        return this.roles;
    }

    create(dto: CreateRoleDto) {
        const newRole = { id: Date.now().toString(), ...dto };
        this.roles.push(newRole);
        return newRole;
    }

    update(id: string, dto: UpdateRoleDto) {
        const idx = this.roles.findIndex((r) => r.id === id);
        if (idx === -1) return null;
        this.roles[idx] = { ...this.roles[idx], ...dto };
        return this.roles[idx];
    }

    remove(id: string) {
        const idx = this.roles.findIndex((r) => r.id === id);
        if (idx === -1) return null;
        const [removed] = this.roles.splice(idx, 1);
        return removed;
    }
}
