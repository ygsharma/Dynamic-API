import { ResourceRelation } from "../common.interface";
import { attributesTypes } from "../constants/common";
import { typeMap } from "../constants/typeMap";

export const generateObject = (obj: any) => {
  let tmp = {};

  if (obj.isArray && obj.type == attributesTypes.object) {
    tmp[obj.name] = [];
    let tmpObj = {};
    for (const item of obj.children) {
      let current = generateObject(item);
      tmpObj[item.name] = current[item.name];
    }
    tmp[obj.name].push(tmpObj);
  } else if (!obj.isArray && obj.type == attributesTypes.object) {
    let tmp1 = {};
    for (const item of obj.children) {
      let current = generateObject(item);
      tmp1[item.name] = current[item.name];
    }
    tmp[obj.name] = tmp1;
  } else if (obj.isArray && obj.type != attributesTypes.object) {
    tmp[obj.name] = [{ type: typeMap[obj.type] }];
  } else {
    tmp[obj.name] = {
      type: typeMap[obj.type],
    };
    if (obj.enumValues && obj.enumValues.length > 0) {
      tmp[obj.name].enum =
        obj.type == attributesTypes.number ||
        obj.type == attributesTypes.integer
          ? obj.enumValues.map((x) => Number(x))
          : obj.enumValues;
    }

    if (obj.required) {
      tmp[obj.name].required = obj.required;
    }
  }
  return tmp;
};

// This is for schema-inspector
// export const generateValidationSchema1 = (obj: any) => {
//   let tmp = {};

//   // {
//   //   "id": 2,
//   //   "name": "resource_1",
//   //   "parent": 1,
//   //   "branchColor": "#FCB900",
//   //   "legendId": "default",
//   //   "description": "Attr11_this is Recription",
//   //   "type": "object",
//   //   "pageable": false,
//   //   "queryParams": [],
//   //   "crud": [
//   //     "CREATE",
//   //     "READ",
//   //     "UPDATE"
//   //   ],
//   //   "enumValues": [],
//   //   "children": [
//   //     {
//   //       "id": 719796387837,
//   //       "name": "Attribute 1",
//   //       "parent": 2,
//   //       "branchColor": "#FCB900",
//   //       "legendId": "default",
//   //       "description": "",
//   //       "type": "string",
//   //       "pageable": false,
//   //       "children": [],
//   //       "queryParams": [],
//   //       "crud": [
//   //         "CREATE",
//   //         "READ",
//   //         "UPDATE",
//   //         "DELETE"
//   //       ],
//   //       "enumValues": [],
//   //       "searchEnabled": true,
//   //       "patchEnabled": false,
//   //       "visibility": "READ_WRITE",
//   //       "required": true,
//   //       "xDescription": "",
//   //       "abstract": true,
//   //       "isArray": false,
//   //       "isSubPath": false,
//   //       "inDocumention": true,
//   //       "queryable": false
//   //     }
//   //   ],
//   //   "searchEnabled": true,
//   //   "patchEnabled": false,
//   //   "visibility": "READ_WRITE",
//   //   "required": false,
//   //   "xDescription": "",
//   //   "abstract": true,
//   //   "isArray": false,
//   //   "isSubPath": true,
//   //   "inDocumention": true,
//   //   "queryable": false
//   // }

//   if (obj.isArray && obj.type == "object") {
//     tmp[obj.name] = {
//       type: "array",
//       items: { type: "object", properties: {} },
//     };
//     // let tmpObj = {};
//     for (const item of obj.children) {
//       // let tmpObj = {};
//       let current = generateValidationSchema(item);
//       // tmpObj[item.name] = current;
//       tmp[obj.name].items.properties[item.name] = current[item.name];
//     }
//     // console.log({ tmpObj });
//     console.log({ tmp });
//   } else if (!obj.isArray && obj.type == "object") {
//     let tmp1 = { type: obj.type, properties: {} };
//     for (const item of obj.children) {
//       let current = generateValidationSchema(item);
//       tmp1.properties[item.name] = current[item.name];
//     }
//     tmp[obj.name] = tmp1;
//   } else if (obj.isArray && obj.type != "object") {
//     tmp[obj.name] = { type: "array", items: { type: obj.type } };
//   } else {
//     tmp[obj.name] = {
//       type: obj.type,
//     };

//     if (obj.enumValues && obj.enumValues.length > 0) {
//       tmp[obj.name].eq =
//         obj.type == "number" || obj.type == "integer"
//           ? obj.enumValues.map((x) => Number(x))
//           : obj.enumValues;
//     }

//     if (obj.required) {
//       tmp[obj.name].optional = !obj.required;
//     }
//   }
//   return tmp;
// };

// Tis is for ajv schema generator
export const generateValidationSchema = (
  obj: any,
  relation: ResourceRelation[]
) => {
  let tmp = {};

  if (obj.isArray && obj.type == attributesTypes.object) {
    tmp[obj.name] = {
      type: attributesTypes.array,
      items: { type: attributesTypes.object, properties: {}, required: [] },
    };
    // let tmpObj = {};
    for (const item of obj.children) {
      // let tmpObj = {};
      let current = generateValidationSchema(item, relation);
      // tmpObj[item.name] = current;
      tmp[obj.name].items.properties[item.name] = current[item.name];
      if (item.required) {
        tmp[obj.name].items.required.push(item.name);
      }
    }
    // console.log({ tmpObj });
  } else if (!obj.isArray && obj.type == attributesTypes.object) {
    let tmp1: { type: string; properties: any; required: string[] } = {
      type: obj.type,
      properties: {},
      required: [],
    };
    for (const item of obj.children) {
      let current = generateValidationSchema(item, relation);
      tmp1.properties[item.name] = current[item.name];
      if (item.required) {
        // Add required field
        tmp1.required = tmp1.required || [];
        tmp1.required.push(item.name);
      }
    }

    tmp[obj.name] = tmp1;
  } else if (obj.isArray && obj.type != attributesTypes.object) {
    tmp[obj.name] = { type: attributesTypes.array, items: { type: obj.type } };
  } else {
    tmp[obj.name] = {
      type:
        obj.type == attributesTypes.date ? attributesTypes.string : obj.type,
    };

    if (obj.type == attributesTypes.date) {
      tmp[obj.name].format = "date";
    }

    if (obj.enumValues && obj.enumValues.length > 0) {
      tmp[obj.name].enum =
        obj.type == attributesTypes.number ||
        obj.type == attributesTypes.integer
          ? obj.enumValues.map((x) => Number(x))
          : obj.enumValues;
    }
    if (obj.isRelation) {
      relation.push({ ...obj.relation, from: obj.name });
    }

    // if (obj.required) {
    //   tmp[obj.name].optional = !obj.required;
    // }
  }
  return tmp;
};
