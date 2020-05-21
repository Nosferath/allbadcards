import {Validator} from "jsonschema";
import {JSONSchema4} from "json-schema";

export const AbcPackSchema: JSONSchema4 = {
	"$schema": "http://json-schema.org/draft-04/schema#",
	"type": "object",
	"properties": {
		"pack": {"$ref": "#/definitions/pack"},
		"buildVersion": {"type": "integer"}
	},
	"definitions": {
		"pack": {
			"type": "object",
			"properties": {
				"black": {
					"type": "array",
					"items": {"$ref": "#/definitions/blackCard"}
				},
				"white": {
					"type": "array",
					"items": {"type": "string"}
				},
				"pack": {"$ref": "#/definitions/packMeta"},
				"quantity": {
					"type": "object",
					"properties": {
						"black": {"type": "integer"},
						"white": {"type": "integer"},
						"total": {"type": "integer"},
					}
				}
			}
		},
		"blackCard": {
			"type": "object",
			"properties": {
				"content": {"type": "string"},
				"draw": {"type": "integer", "minimum": 0, "maximum": 2},
				"pick": {"type": "integer", "minimum": 1, "maximum": 3},
			},
			"required": ["content"]
		},
		"packMeta": {
			"type": "object",
			"properties": {
				"id": {"type": "string"},
				"name": {"type": "string"},
			}
		}
	}
};

const validator = new Validator();

export const validatePackInput = (packData: any) =>
{
	return validator.validate(packData, AbcPackSchema);
};

export const getSchemas = () => validator.schemas;