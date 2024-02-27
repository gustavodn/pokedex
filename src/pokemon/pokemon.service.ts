import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private readonly default_limit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.default_limit = this.configService.get('DEFAULT_LIMIT');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const createdPokemon = await this.pokemonModel.create(createPokemonDto);
      return createdPokemon;
    } catch (error) {
      this.handleExceptionError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.default_limit, offset = 0 } = paginationDto;

    return this.pokemonModel.find().skip(offset).limit(limit).sort({ no: 1 });
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if (isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: term.toLocaleLowerCase().trim(),
      });
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = this.findOne(term);

    if (!pokemon) {
      throw new BadRequestException(`Pokemon with term ${term} not found`);
    }

    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

    try {
      await this.pokemonModel.updateOne(updatePokemonDto);
    } catch (error) {
      this.handleExceptionError(error);
    }

    return { ...(await pokemon).toJSON(), ...updatePokemonDto };
  }

  async remove(id: string): Promise<void> {
    try {
      const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
      if (deletedCount === 0)
        throw new BadRequestException(`Pokemon with id ${id} not found`);
    } catch (error) {
      this.handleExceptionError(error);
    }

    return;
  }

  handleExceptionError(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon with name ${error.keyValue.name} already exists`,
      );
    }
    console.error(`Error creating pokemon: ${error}`);
  }
}
