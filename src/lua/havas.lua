buffer_id = -1

function HAVAS_createBufferIfNotExists()
	if not buffer_id or buffer_id < 0 then
		vim.cmd':new +setl\\ buftype=nofile'
		buffer_id = vim.api.nvim_get_current_buf()
		print(buffer_id)
	else
		print(buffer_id)
	end
end
-- createBufferIfNotExists

-- vim.api.nvim_buf_set_lines(buffer_id, 0, -1, false, data)

-- vim.api.nvim_create_user_command(
-- COMMAND_SHOW_LAST,
-- function(_)
-- vim.cmd(':sbuffer ' .. buffer_id)
-- end,
-- {}
-- )
