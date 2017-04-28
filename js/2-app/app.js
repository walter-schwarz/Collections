//noinspection JSHint
'use strict';

if(!window.HappCMS) {
	var Collections = {};
}
Collections.App = (function() {
	// objects, _ prefixed objects are internal (not returned)
	var _app_options, _tmdb_api_config;
	// functions, _ prefixed functions are internal (not returned)
	var init,
		_loadLocalList, _loadLocalListItem,
		_getApiConfig, _getListsOverview, _loadListsOverview, _loadListsOverviewItem, _getList, _loadList, _loadListItem;

	_app_options = {
		els: {
			local_list: null,
			local_file_input: null,
			tmdb_list: null
		},
		tmdb: {
			api_key: '',
			api_read_access_token: '',
			api_read_write_access_token: '', // TODO: generate automatically based on user's TMDB account http://dev.travisbell.com/play/v4_auth.html
			api_read_write_access_token2: '', // for testing, not needed
			account_id: '', // TODO: get automatically after account authorization, see above
			api_host: '',
			web_host: ''
		}
	};
	init = function(set_options) {
		$.extend(true, _app_options, set_options);
		$.each(_app_options.els, function (name, value) {
			_app_options.els[name] = $(value);
		});
		_app_options.els.local_file_input.change(_loadLocalList);
		_getApiConfig({
			on_done: _getListsOverview
		});
	};

	// Local
	_loadLocalList = function(load_local_list_event) {
		// TODO: also get the TMDB ID from the movie folder name so that we can easily add it to the list
		// TODO: make Kodi store scraped posters inside the movie folder so we can load them here when needed: https://www.howtogeek.com/301671/how-and-why-to-your-kodi-media-center-artwork-with-your-media/
		var _names = {};
		$.each(load_local_list_event.target.files, function(id, file_data) {
			var _path = file_data.webkitRelativePath.split('/');
			if(_path.length > 2) { // if the path only has 2 parts then its a file in the root of the selected folder and we can ignore it as we are looking for sub-folders
				_names[_path[1]] = 1;
			}
		});
		_names = Object.keys(_names).sort();
		$.each(_names, function(id, name) {
			_loadLocalListItem({
				name: name
			});
		});
	};
	_loadLocalListItem = function(load_local_list_item_data) {
		_app_options.els.local_list.append($('<li>'+load_local_list_item_data.name+'</li>'));
	};

	// TMDB
	_getApiConfig = function(get_api_config_options) {
		$.ajax({
			url: _app_options.tmdb.api_host + '/3/configuration',
			data: {
				api_key: _app_options.tmdb.api_key
			},
			type: 'GET',
			dataType: 'json'
		}).fail(function(response) {
			debugger;
			// TODO: show error
		}).done(function(response) {
			_tmdb_api_config = response;
			if(get_api_config_options.on_done && $.type(get_api_config_options.on_done) === 'function') {
				get_api_config_options.on_done();
			}
		});
	};
	_getListsOverview = function() {
		$.ajax({
			url: _app_options.tmdb.api_host + '/4/account/' + _app_options.tmdb.account_id + '/lists',
			data: {
				page: 1
			},
			type: 'GET',
			dataType: 'json',
			headers: {
				'Authorization': 'Bearer ' + _app_options.tmdb.api_read_write_access_token,
				'Content-Type': 'application/json'
			}
		}).fail(function(response) {
			debugger;
			// TODO: show error
		}).done(function(response) {
			// TODO: if there are more pages load all pages recursively
			_loadListsOverview(response);
		});
	};
	_loadListsOverview = function(load_lists_Overview_data) {
		var _modal_el = $('<div></div>').appendTo('body'),
			_list_overview_el = $('<ul></ul>').appendTo(_modal_el),
			_modal;
		$.each(load_lists_Overview_data.results, function(id, item_data) {
			_list_overview_el.append(_loadListsOverviewItem(item_data));
		});
		_modal = _modal_el.iziModal({
			onOpened: function(_modal) {
				_modal.$element.find('a[data-list_id]').click(function() {
					var _item_link = $(this);
					_getList({
						list_id: _item_link.data('list_id')
					});
					_modal.close();
				});
			}
		});
		_modal.iziModal('open');
	};
	_loadListsOverviewItem = function(load_lists_overview_item_data) {
		return $('<li><a data-list_id="'+load_lists_overview_item_data.id+'">'+load_lists_overview_item_data.name+'</a></li>');
	};
	_getList = function(load_list_options) {
		_app_options.els.tmdb_list.empty();
		$.ajax({
			url: _app_options.tmdb.api_host + '/4/list/' + load_list_options.list_id,
			data: {
				page: 1
			},
			type: 'GET',
			dataType: 'json',
			headers: {
				'Authorization': 'Bearer ' + _app_options.tmdb.api_read_write_access_token,
				'Content-Type': 'application/json'
			}
		}).fail(function(response) {
			debugger;
			// TODO: show error
		}).done(function(response) {
			// TODO: if there are more pages load all pages recursively
			_loadList(response);
		});
	};
	_loadList = function(load_list_data) {
		// TODO: load also list name, backdrop and extra info
		$.each(load_list_data.results, function(id, item_data) {
			_loadListItem(item_data);
		});
	};
	_loadListItem = function(load_list_item_data) {
		_app_options.els.tmdb_list.append($('<li>'+load_list_item_data.title+' ('+(load_list_item_data.release_date.split('-')[0])+')</li>'));
	};
	return {
		init: init
	};

	// Other
	// TODO: add functions to compare the 2 lists and add missing movies to the TMDB list
	// TODO: also allow setting the comment text for the movies to save
})();

$(document).ready(Collections.App.init.bind(null, {
	els: {
		local_list: '#local_list_items',
		local_file_input: '#local_file_input',
		tmdb_list: '#tmdb_list_items'
	},
	tmdb: {
		api_key: 'af569b73de09d4c7f98f66f494aa3b19',
		api_read_access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZjU2OWI3M2RlMDlkNGM3Zjk4ZjY2ZjQ5NGFhM2IxOSIsInN1YiI6IjU4ZDhmMGJhYzNhMzY4MTIzNDA2OGVhZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.qqVlsuVbljYABGlBAAj-u8yFoGxoyDHzgjZLoDS85FQ',
		api_read_write_access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE0OTE0Mjk5MzEsInZlcnNpb24iOjEsInN1YiI6IjU4ZDhmMGJhYzNhMzY4MTIzNDA2OGVhZiIsImF1ZCI6ImFmNTY5YjczZGUwOWQ0YzdmOThmNjZmNDk0YWEzYjE5Iiwic2NvcGVzIjpbImFwaV9yZWFkIiwiYXBpX3dyaXRlIl0sImp0aSI6IjIxMTAxMCJ9.3x69C6v-GuVUeqJdDwaK_Wm9q5hT8sTYIAx2Cdnj4_o',
		api_read_write_access_token2: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYmYiOjE0OTMzMTkwNTYsInZlcnNpb24iOjEsInN1YiI6IjU4ZDhmMGJhYzNhMzY4MTIzNDA2OGVhZiIsImF1ZCI6ImFmNTY5YjczZGUwOWQ0YzdmOThmNjZmNDk0YWEzYjE5Iiwic2NvcGVzIjpbImFwaV9yZWFkIiwiYXBpX3dyaXRlIl0sImp0aSI6IjIzNTc3MSJ9.WwaNE4_4qmIBb-pR3q3MV2rERqjmIabtidaJE3SFJKA', // for testing, not needed
		account_id: '58d8f0bac3a3681234068eaf',
		api_host: 'https://api.themoviedb.org',
		web_host: 'https://www.themoviedb.org'
	}
}));