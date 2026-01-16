import { DataTypes, Model, Optional } from 'sequelize';

export interface CategoryAttributes {
    id: number;
    name: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CategoryCreationAttributes
    extends Optional<CategoryAttributes, 'id'> { }

export class Category
    extends Model<CategoryAttributes, CategoryCreationAttributes>
    implements CategoryAttributes {
    public id!: number;
    public name!: string;
    public description?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initModel(sequelize: any): typeof Category {
        Category.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                name: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                createdAt: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                },
            },
            {
                sequelize,
                modelName: 'Category',
                tableName: 'categories',
                timestamps: true,
            }
        );
        return Category;
    }
} 