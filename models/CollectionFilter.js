export class CollectionFilter {
    constructor(data, params, model) {
        this.data = data;
        this.model = model;
        this.params = params || {};
    }

    filterData() {
        if (this.params.sort) {
            let [field, order] = this.params.sort.split(',');
            field = this.mapFieldName(field); // Map "Name" to "Title" for sorting
            this.data = this.sortData(this.data, field, order);
        }

        if (this.params.limit && this.params.offset) {
            const limit = parseInt(this.params.limit);
            const offset = parseInt(this.params.offset);
            this.data = this.paginateData(this.data, limit, offset);
        }

        if (this.params.field) {
            let fields = this.params.field.split(',');
            // Map "Name" to "Title" for field selection
            fields = fields.map(field => this.mapFieldName(field));
            this.data = this.selectFields(this.data, fields);
            // Create a Set to remove duplicates
            const uniqueData = new Set(this.data.map(JSON.stringify));
            this.data = Array.from(uniqueData).map(JSON.parse);
        }

        for (const param in this.params) {
            if (param !== 'sort' && param !== 'limit' && param !== 'offset' && param !== 'field') {

                let field = this.mapFieldName(param); // Map "Name" to "Title" for filtering
                this.data = this.filterByField(this.data, field, this.params[param]);
            }
        }

        return this.data;
    }

    mapFieldName(field) {
        // Map "Name" to "Title" if necessary
        if (field === 'Name') {
            return 'Title';
        }
        return field;
    }
    sortData(data, field, order) {

        const orderMultiplier = order === 'desc' ? -1 : 1;
        return data.sort((a, b) => {
            const aValue = a[field];
            const bValue = b[field];
            if (aValue < bValue) return -1 * orderMultiplier;
            if (aValue > bValue) return 1 * orderMultiplier;
            return 0;
        });
    }

    paginateData(data, limit, offset) {
        const startIndex = ((offset) * limit);
        const endIndex = startIndex + limit;
        return data.slice(startIndex, endIndex);
    }

    selectFields(data, fields) {
        return data.map(item => {
            const selected = {};
            fields.forEach(field => {
                selected[field] = item[field];
            });
            return selected;
        });
    }



    filterByField(data, field, filter) {
        return data.filter(item => {
            const itemValue = item[field].toLowerCase(); // Convert item[field] to lowercase
            filter = filter.toLowerCase(); // Convert filter to lowercase

            if (filter.startsWith('*') && filter.endsWith('*')) {
                return itemValue.includes(filter.slice(1, -1));
            } else if (filter.startsWith('*')) {
                return itemValue.endsWith(filter.slice(1));
            } else if (filter.endsWith('*')) {
                return itemValue.startsWith(filter.slice(0, -1));
            } else {
                return itemValue === filter;
            }
        });
    }

}

