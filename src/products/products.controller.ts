import { Controller, Get, Post, Body, Query, Param, Delete, Patch } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  findAll(
    @Query('location') location?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    return this.productsService.findAll(
      location, 
      sort, 
      page ? parseInt(page) : 1, 
      limit ? parseInt(limit) : 20,
      search
    );
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo producto' })
  create(@Body() data: CreateProductDto) {
    return this.productsService.create(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Get('count')
  @ApiOperation({ summary: 'Obtener cantidad de productos' })
  getCount() {
    return this.productsService.getCount();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener productos activos' })
  getActive() {
    return this.productsService.getActive();
  }

  @Get('seller/:seller')
  @ApiOperation({ summary: 'Obtener productos por vendedor' })
  getBySeller(@Param('seller') seller: string) {
    return this.productsService.getBySeller(seller);
  }

  @Get('price-range')
  @ApiOperation({ summary: 'Obtener productos por rango de precio' })
  getByPriceRange(
    @Query('min') min: string,
    @Query('max') max: string
  ) {
    return this.productsService.getByPriceRange(
      min ? parseFloat(min) : 0,
      max ? parseFloat(max) : 999999
    );
  }

  @Get('latest')
  @ApiOperation({ summary: 'Obtener productos más recientes' })
  getLatest(@Query('limit') limit?: string) {
    return this.productsService.getLatest(
      limit ? parseInt(limit) : 10
    );
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Obtener productos por estado' })
  getByStatus(@Param('status') status: string) {
    return this.productsService.getByStatus(status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas de productos' })
  getStats() {
    return this.productsService.getStats();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Obtener productos destacados' })
  getFeatured(@Query('limit') limit?: string) {
    return this.productsService.getFeatured(
      limit ? parseInt(limit) : 6
    );
  }

  @Get('location/:location')
  @ApiOperation({ summary: 'Obtener productos por ubicación' })
  getByLocation(@Param('location') location: string) {
    return this.productsService.getByLocation(location);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Mejorar usuario a Premium' })
  upgradeUser(@Body('seller') seller: string) {
    return this.productsService.upgradeUser(seller || 'Usuario Actual');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.productsService.update(+id, data);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar estado del producto' })
  updateStatus(@Param('id') id: string, @Body() data: any) {
    return this.productsService.update(+id, { status: data.status });
  }
}
