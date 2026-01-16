import { DataTypes } from 'sequelize';

export default function defineKnowledgeBase(sequelize) {
  const KnowledgeBase = sequelize.define('KnowledgeBase', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('document', 'api', 'website', 'text'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    api_endpoint: {
      type: DataTypes.STRING,
      allowNull: true
    },
    api_method: {
      type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE'),
      allowNull: true
    },
    api_headers: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('api_headers');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('api_headers', value ? JSON.stringify(value) : null);
      }
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('tags');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('tags', value ? JSON.stringify(value) : '[]');
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'knowledge_bases',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return KnowledgeBase;
}
