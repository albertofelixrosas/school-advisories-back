import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AdvisoriesService } from './advisories.service';
import { CreateAdvisoryDto } from './dto/create-advisory.dto';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('advisories')
@Controller('advisories')
export class AdvisoriesController {
  constructor(private readonly advisoriesService: AdvisoriesService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Asesoría creada exitosamente' })
  create(@Body() createAdvisoryDto: CreateAdvisoryDto) {
    return this.advisoriesService.create(createAdvisoryDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Lista de asesorías' })
  findAll() {
    return this.advisoriesService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Detalle de asesoría' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.advisoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Asesoría actualizada exitosamente',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdvisoryDto: UpdateAdvisoryDto,
  ) {
    return this.advisoriesService.update(id, updateAdvisoryDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Asesoría eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.advisoriesService.remove(id);
  }
}
