# RUN_ID: diag_01
import os
s_log = open('server.log').read()[-500:] if os.path.exists('server.log') else 'no server.log'
t_log = open('tunnel.log').read()[-400:] if os.path.exists('tunnel.log') else 'no tunnel.log'
notify('DIAG_SERVER: ' + s_log)
notify('DIAG_TUNNEL: ' + t_log)
