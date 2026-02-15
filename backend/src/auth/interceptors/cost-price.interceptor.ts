import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Role } from '@prisma/client';

@Injectable()
export class CostPriceInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        return next.handle().pipe(
            map((data) => {
                if (user && user.role === Role.ADMIN) {
                    return this.maskCostPrice(data);
                }
                return data;
            }),
        );
    }

    private maskCostPrice(data: any): any {
        if (Array.isArray(data)) {
            return data.map((item) => this.maskCostPrice(item));
        }

        if (data !== null && typeof data === 'object') {
            // Check if it's a plain object or array. 
            // If it's a special object (like Decimal or Date), don't recurse.
            const isPlain = data.constructor === Object || data.constructor === undefined;

            if (!isPlain) {
                return data;
            }

            const result: any = {};
            const sensitiveKeys = ['hargaPokok', 'hpp', 'nilai'];

            Object.keys(data).forEach((key) => {
                if (!sensitiveKeys.includes(key)) {
                    result[key] = this.maskCostPrice(data[key]);
                }
            });

            return result;
        }
        return data;
    }
}
