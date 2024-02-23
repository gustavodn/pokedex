import { IsNumber, IsString, IsPositive, IsInt, Min } from 'class-validator';

export class CreatePokemonDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  @IsInt()
  @Min(1)
  no: number;
}
