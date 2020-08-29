import datetime
import math
import re
import sys

cur_date = datetime.datetime.utcnow()

def get_ver(version):
    day_num = (cur_date - datetime.datetime(2013, 9, 12)).days
    min_num = int(math.floor(((cur_date.hour * 60) + cur_date.minute) / 14.4))
    ver = re.findall(r'\d+', version)
    ver_str = '.'.join((ver[0], ver[1], str(day_num), str(min_num)))
    ver_str += ''.join(re.findall('[a-z]+', version))

    return ver_str

print(get_ver(sys.argv[1]))
