-- vim.cmd':new +setl\\ buftype=nofile'
--
-- buffer_id = vim.api.nvim_get_current_buf()
-- window_id = vim.api.nvim_win_get_number()
--
-- vim.api.nvim_win_set_config(window_id, {})
-- vim.cmd[[
--
-- let buf = nvim_create_buf(v:false, v:true)
-- call nvim_buf_set_lines(buf, 0, -1, v:true, ["test", "text"])
-- let opts = {'relative': 'cursor', 'width': 10, 'height': 2, 'col': 0,
-- \ 'row': 1, 'anchor': 'NW', 'style': 'minimal'}
-- let win = nvim_open_win(buf, 0, opts)
-- " optional: change highlight, otherwise Pmenu is used
-- call nvim_win_set_option(win, 'winhl', 'Normal:MyHighlight')
--
-- ]]
buffer_id = vim.api.nvim_create_buf(false, true)

vim.api.nvim_buf_set_lines(buffer_id, 0, -1, false, { 'asd', 'basd', 'aaaaaaaaaaaaaaaa' })
local _config = {
	relative = 'cursor',
	width = 20,
	height = 4,
	col = 0,
	row = 1,
	anchor = 'NW',
	style = 'minimal',
	border = 'rounded',
}
vim.api.nvim_open_win(buffer_id, true, _config)
