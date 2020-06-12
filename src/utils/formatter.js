import Table from 'cli-table3';
import { map } from 'lodash';
import log from './logger';
import columnWidth from './column-width';

class formatter {
	/**
	 * Command Builder argument params
	 *
	 * @returns {{format: {default: string, describe: string, type: string}, separator: {default: string, describe: string, type: string}}}
	 */
	static commandArgs() {
		return {
			format: {
				default: 'table',
				describe: 'Format the output, value: table, string, json, list',
				type: 'string',
			},
			separator: {
				default: ' ',
				describe: 'Separator value when the output format is string',
				type: 'string',
			},
		};
	}

	/**
	 * Format the output with table format
	 *
	 * @param {string} fields Table head, comma separated
	 * @param {Array} rows Rows of the data
	 */
	static toTable(fields, rows) {
		const table = new Table({
			head: fields.split(','),
			colWidths: fields.split(',').map((field) => columnWidth(field)),
			wordWrap: true,
		});

		const colWidths = fields.split(',').map((field) => columnWidth(field));
		rows.forEach(function (row) {
			row.forEach(function (rowField, index) {
				colWidths[index] = Math.max(colWidths[index], rowField.length + 5);
			});
			table.push(row);
		});

		table.options.colWidths = colWidths;

		log.success(table.toString());
	}

	/**
	 * Format the output with table format
	 *
	 * @param {string} fields Label, comma separated
	 * @param {Array} rows Rows of the data
	 */
	static toList(fields, rows) {
		const table = new Table({
			head: ['Field', 'Value'],
			wordWrap: true,
		});

		const labels = fields.split(',');
		const colWidths = [20, 20];
		labels.forEach(function (label, i) {
			const row = {};
			row[label] = rows[i];
			table.push(row);

			// Count column width
			colWidths[0] = Math.max(colWidths[0], label.length + 5);
			colWidths[1] =
				typeof rows[i] === 'string'
					? Math.max(colWidths[1], rows[i].length + 5)
					: colWidths[1];
		});

		table.options.colWidths = colWidths;

		log.success(table.toString());
	}

	/**
	 * Format the output as defined separator
	 *
	 * @param {Array} rows Rows of the data
	 * @param {string} separator Separator, default a space
	 */
	static toString(rows, separator = ' ') {
		log.success(rows.join(separator));
	}

	/**
	 * Format the output as JSON
	 *
	 * @param {Array} rows Rows of the data
	 */
	static toJson(rows) {
		log.success(JSON.stringify(rows));
	}

	static output(args) {
		const { fields, format, separator, results } = args;

		switch (format) {
			case 'json':
				formatter.toJson(results);
				break;
			case 'string':
				formatter.toString(results, separator);
				break;
			case 'list':
				formatter.toList(fields, results);
				break;
			case 'table':
			default:
				formatter.toTable(fields, results);
				break;
		}
	}

	/**
	 * Filter fields from array of json objects
	 *
	 * @param {string} fields Fields to get in comma separated
	 * @param {Array} results Array of json objects.
	 * @returns {Array}
	 */
	static mappingFields(fields, results) {
		const truncate = (input) => {
			return input.length > 70 ? `${input.substring(0, 70)}...` : input;
		};

		return map(results, function (item) {
			const output = [];

			fields.split(',').forEach(function (field) {
				let value = item[field];

				if (Array.isArray(item[field])) {
					value = item[field].join(',');
				}

				if (typeof item[field] === 'string') {
					value = truncate(item[field]);
				}

				output.push(typeof item[field] === 'undefined' ? '' : value.toString());
			});

			return output;
		});
	}

	/**
	 * Filter fields from a json object
	 *
	 * @param {string} fields Fields to get in comma separated
	 * @param {object} result A json objects.
	 * @returns {Array}
	 */
	static mappingField(fields, result) {
		const results = [];
		fields.split(',').forEach((field) => {
			if (field === 'filter') {
				results.push(result[field].id);
				return;
			}
			results.push(typeof result[field] === 'undefined' ? '' : result[field]);
		});

		return results;
	}
}

export default formatter;
