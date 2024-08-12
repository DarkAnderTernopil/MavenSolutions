import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Container {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  image: string = 'node';
}

export class Spec {
  @ValidateNested({ each: true })
  @Type(() => Container)
  containers: Container[];
}

export class CreatePodDto {
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => Spec)
  spec: Spec;
}
