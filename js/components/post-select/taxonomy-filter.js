import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import _get from 'lodash/get';
import wp from 'wp';

const { withAPIData } = wp.components;

class TaxonomyFilter extends React.Component {
	constructor( props ) {
		super( props );

		const CollectionClass = wp.api.getTaxonomyCollection( this.props.taxonomy );

		this.state = {
			isLoading: false,
			page:      1,
		};

		this.collection = new CollectionClass();

		this.collection.on( 'request', () => this.setState( { isLoading: true } ) );
		this.collection.on( 'sync error', () => this.setState( { isLoading: false } ) );
	}

	componentDidMount() {
		this.fetchTerms();
	}

	render() {
		const { onChange, tax, taxonomy, value } = this.props;
		const id = `post-select-${taxonomy}-filter`;
		const isLoading = ( tax.isLoading || this.state.isLoading );
		const label = _get( tax, 'data.name', taxonomy );

		const selectProps = {
			id,
			isLoading,
			value,
			backspaceRemoves: true,
			multi:            true,
			options:          this.state.terms,
			onChange:         selected => onChange( selected.map( option => option.value ) ),
		};

		return <div className="post-select-filters-row">
			<label htmlFor={ id }>{ label }</label>
			<Select { ...selectProps } />
		</div>;
	}

	getFetchOptions() {
		return {
			data: {
				page:     this.state.page,
				per_page: 100,
				terms:    [],
			},
		};
	}

	/**
	 * Fetch terms
	 */
	fetchTerms() {
		this.collection.fetch( this.getFetchOptions() )
			.done( result => {
				const terms = result.map( term => ( {
					label: term.name,
					value: term.id,
				} ) );

				this.setState( { terms } );
			} );
	}
}

TaxonomyFilter.defaultProps = { value: [] };

TaxonomyFilter.propTypes = {
	onChange: PropTypes.func.isRequired,
	taxonomy: PropTypes.string.isRequired,
	value:    PropTypes.arrayOf( PropTypes.number ),
};

const TaxonomyFilterWithAPIData = withAPIData( ( { taxonomy } ) => {
	return { tax: `/wp/v2/taxonomies/${ taxonomy }` };
} )( TaxonomyFilter );

export default TaxonomyFilterWithAPIData;
