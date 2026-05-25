import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService implements OnModuleInit {
  // Mock user store for the subscription logic
  private users = {
    'Usuario Actual': { isPremium: false, productCount: 0 }
  };

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // Seed data if DB is empty
  async onModuleInit() {
    try {
      const count = await this.productRepo.count();
    if (count === 0) {
      await this.productRepo.save([
        {
          title: 'Memoria RAM Corsair Vengeance 16GB',
          price: 100,
          seller: 'TechStore',
          location: 'Caracas, Chacao',
          delivery: 'Entrega Segura',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjhsamMZ4LrlFnjAVsf_QNPOlctqTgbR48LtBb6kR-iNI_ynh8Cmzw0JwTqheqTfUzK1rlguxcDBfo_Rs_oDIbkA4PCfLLxKMJq47wkCoEmQu3VzYhyNedHF_7WvoodFvffVlol8RZOLhIs4w8Ma2Q-d7r3vinfCdx1Z7TzfJi_VhA2fpcloxf_Fan0b7gv1RngayNFteLoD_ZNLQJ6KnUSZFRvJ3jd4rsrR-Oa1AfNLyDGvFw0J9HcjzqOQBVOqcvYOZvK_tzflj8'
        },
        {
          title: 'Procesador Intel Core i9 14900K (Sellado)',
          price: 600,
          seller: 'PcParts',
          location: 'San Antonio',
          delivery: 'Envío con QR',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBi5Z1fJCoXiKyENcOc3I-82L0h_cKFfEEoWK3eWZZSnvIrYi6aCAPK6rawBIvqp6rJ-Cz18771rxaGE6SbXQmxAWzeoSWkZ6-O0UhhVq2XwoYdaVoIoH5BAeIeJmiAzxXOvs579w0XC0v0H0R0zD3kqI__NdcJvQuBdNUx8KxfSFioH0bzy-LPOXLTzuFClxNe6WUTFsulruyYxTZ3j6dxIwtI78-XVSQ4FVgULwuPM46haFJuHdw41dyeliUjeagwMdm7lJ6_nd0t'
        },
        {
          title: 'Subaru XV 2016 - Excelente Estado',
          price: 5500,
          seller: 'AutoVentas',
          location: 'Valencia',
          delivery: 'Entrega Segura',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfdAwONQHUAyFOisgab-Lyvq6yrQLojkBFgu6Pj7fXyLa8OIJONw1ZHUlVazEjfamcPgroTa1rXoEfeWh19nNCrBiZQ5YqMjkeKgIIJq7FNtaSKWWiD2gFRPtG_mrJGUUTnVKqGI2hUpCnRQuU9huIpuKCSMNXeFP_Tdyznu60SiwWUTNVOp_zfqqpFFDh15Jb7iGn2_iFylacxqR43qfpL6sf8MNysUm5RWbsJ9vOmtz4YhkZShigliMaQGG0H6wo2Q_kYiFBOri6'
        },
        {
          title: 'Guitarra Eléctrica Custom + Estuche',
          price: 250,
          seller: 'MusicMan',
          location: 'Maracaibo',
          delivery: 'Envío con QR',
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCl-u3tR3f9LjXXc_hwNuciiiRc_nLL2ZF75LDdP39mll2s8Rnrn0EJ-yu596PBK9F3aDkRN7ZwRbKQRCYdTQtjfwASySwPtMQ0mSjrw222TDcODkkd_96m1aZtYJR6b-EH8iydzOU8nxgcvtb0DtwASta6lBxYHT1KGqqPCUIo0o9hds12EdORZ1GjaCLdcDrl3amYGVN-UJ_Zaa7xZXe09Zhh4YI5z5_POOHeHv_fusSNl9HbhCeiZ5Bv0zBUlvLA6X0PLh8kz2GO'
        }
      ]);
    }
    } catch(e) {
      console.error("Error seeding data:", e);
    }
  }

  async findAll(location?: string, sort?: string, page = 1, limit = 20, search?: string) {
    const query = this.productRepo.createQueryBuilder('product');

    if (search) {
      query.andWhere('LOWER(product.title) LIKE LOWER(:search)', { search: `%${search}%` });
    }
    if (location) {
      query.andWhere('LOWER(product.location) LIKE LOWER(:location)', { location: `%${location}%` });
    }

    if (sort === 'price_asc') {
      query.orderBy('product.price', 'ASC');
    } else if (sort === 'price_desc') {
      query.orderBy('product.price', 'DESC');
    } else {
      query.orderBy('product.createdAt', 'DESC');
    }

    query.skip((page - 1) * limit).take(limit);

    return await query.getMany();
  }

  async findOne(id: number) {
    return await this.productRepo.findOne({ where: { id } });
  }

  async getCount() {
    return await this.productRepo.count();
  }

  async getActive() {
    return await this.productRepo.find({ where: { status: 'ACTIVE' } });
  }

  async getBySeller(seller: string) {
    return await this.productRepo.find({ where: { seller } });
  }

  async getByPriceRange(min: number, max: number) {
    return await this.productRepo.createQueryBuilder('product')
      .where('product.price >= :min AND product.price <= :max', { min, max })
      .getMany();
  }

  async getLatest(limit = 10) {
    return await this.productRepo.find({
      order: { id: 'DESC' },
      take: limit,
    });
  }

  async getByStatus(status: string) {
    return await this.productRepo.find({ where: { status } });
  }

  async getStats() {
    const total = await this.productRepo.count();
    const active = await this.productRepo.count({ where: { status: 'ACTIVE' } });
    const { sum } = await this.productRepo.createQueryBuilder('product')
      .select('SUM(product.price)', 'sum')
      .getRawOne();
      
    const avgPrice = total > 0 ? Number(sum) / total : 0;
    
    return { total, active, avgPrice: Math.round(avgPrice) };
  }

  async getFeatured(limit = 6) {
    return await this.productRepo.find({
      where: { status: 'ACTIVE' },
      order: { price: 'DESC' },
      take: limit,
    });
  }

  async getByLocation(location: string) {
    return await this.productRepo.createQueryBuilder('product')
      .where('LOWER(product.location) LIKE LOWER(:location)', { location: `%${location}%` })
      .getMany();
  }

  async remove(id: number) {
    const result = await this.productRepo.delete(id);
    return { deleted: result.affected ? result.affected > 0 : false };
  }

  async update(id: number, data: any) {
    await this.productRepo.update(id, data);
    return this.findOne(id);
  }

  upgradeUser(seller: string) {
    if (!this.users[seller]) {
      this.users[seller] = { isPremium: false, productCount: 0 };
    }
    this.users[seller].isPremium = true;
    return { success: true, message: 'User upgraded to Premium' };
  }

  async create(data: any) {
    const seller = data.seller || 'Usuario Actual';
    
    // Check limits
    if (!this.users[seller]) {
      this.users[seller] = { isPremium: false, productCount: 0 };
    }

    const userStats = this.users[seller];
    
    // Only count products created by this specific user
    const currentProducts = await this.productRepo.count({ where: { seller } });

    if (!userStats.isPremium && currentProducts >= 3) {
      throw new BadRequestException('Límite de publicaciones alcanzado. Mejora a Premium para publicaciones ilimitadas.');
    }

    const newProduct = this.productRepo.create({
      ...data,
      seller,
      location: data.location || 'Caracas',
      verified: true,
      status: 'ACTIVE'
    });
    
    return await this.productRepo.save(newProduct);
  }
}
