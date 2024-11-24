import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';

@Injectable()
export class ReportsService {

    constructor(@InjectRepository(Report) private readonly repo: Repository<Report>) { }

    create(reportDto: CreateReportDto) {
        const report = this.repo.create(reportDto as DeepPartial<Report>)
        return this.repo.save(report)
    }
}
 