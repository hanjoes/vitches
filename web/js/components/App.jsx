var React = require('react');
// components
var Search = require('./Search.jsx');
var Filter = require('./Filter.jsx');
var TreeView = require('./TreeView.jsx');
var DetailsView = require('./DetailsView.jsx');
var RankingView = require('./RankingView.jsx');
// js modules
var Actions = require('../actions/Actions');

var App = React.createClass({
  getInitialState() {
    return {
      searchText: "",
      filters: [],// contains all filters, each filter will be assigned one.
      categories: {}// contains all categories for each filter, each fillter will get one
    }
  },

  handleUserInput(searchText, attributes) {
    this.setState({
      searchText: searchText,
    });
  },

  handleFilterAction(filterModified, selectedOption) {
    var _c = this;
    // two things should happen when updating the filters:
    // 1. we should update other filters if it is the first filter value
    // that is changed.
    // 2. if we are selecting options that are not from the first filter,
    // we need to update data for the TreeView *if* we can form a valid path.

    // updating other filters, only when we are modifying the first filter
    if (filterModified["name"] === "Types") {
      Actions.getCategoriesForType(selectedOption, function(data, filterName) {
        var categories = []
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            categories.push(key);
          }
        }
        _c.categories[filterName] = categories;
        _c.setState({
          categories: _c.categories
        });
        return;
      });
    }

    // updating data
    Actions.getFilteredData([], function(data) {
      _c.setState({
        root: data,
      });
    });
  },

  componentWillMount() {
    var _c = this;
    _c.categories = {};
    ////////////////////// initialize filters
    var filterAttrs = Actions.getInitialFilterStates(function(data) {
      var filterConfigs = data["filters"];
      var filters = []
      filterConfigs.forEach(function(filterConfig) {
        filters.push(filterConfig);
      });
      _c.setState({
        filters: filters
      });
    });

    ////////////////////// initialize data
    Actions.getFilteredData([], function(data) {
      _c.setState({
        root: data,
      });
    });

    ////////////////////// initialize rankings
    Actions.getRankedAnimes(function(data) {
      _c.setState({
        ranks: data,
      });
    });
  },

  render() {
    var filters = [];
    var _c = this;
    this.state.filters.forEach(function(filter) {
      filters.push(<Filter
        filter={filter}
        categories={_c.categories[filter["name"]]}
        inputHandler={_c.handleFilterAction}
        key={"filter_" + filter["name"]}
        />
      );
    });

    return (
      <div>
      <h1>ANIVIS</h1>
      <form>
      <Search
      searchText={this.state.searchText}
      inputHandler={this.handleUserInput}
      />
      {filters}
      </form>

      <TreeView root={this.state.root}/>
      <RankingView ranks={this.state.ranks}/>
      {/*<DetailsView />*/}
      </div>
    );
  }
});

module.exports = App;
