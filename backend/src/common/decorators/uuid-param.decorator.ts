import { Param, ParseUUIDPipe } from '@nestjs/common';

// Rejects malformed entity IDs at the HTTP boundary before they reach PostgreSQL.
export const UuidParam = (name = 'id'): ParameterDecorator => Param(name, new ParseUUIDPipe());
