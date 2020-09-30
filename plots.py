# %%

import numpy as np
import matplotlib.pyplot as plt
# ————————————————plotting area
x1 = -10
x2 = 140
y1 = 90
y2 = -10
plt.axis([x1, x2, y1, y2])
plt.axis('on')
# ——————————————————grid
plt.grid(True, color='b')
plt.title('Tick Mark Sample')
# ————————————————tick marks
xmin = x1
xmax = x2
dx = 10
ymin = y1
ymax = y2
dy = -5
plt.xticks(np.arange(xmin, xmax, dx))
plt.yticks(np.arange(ymin, ymax, dy))
plt.show()

# %%
x1 = -5
x2 = 15
y1 = -15
y2 = 5
plt.axis([x1, x2, y1, y2])
plt.axis('on')
dx = .5  # x spacing
dy = .5  # y spacing
for x in np.arange(x1, x2, dx):  # x locations
    for y in np.arange(y1, y2, dy):  # y locations
        plt.scatter(x, y, s=1, color='grey')  # plot a grey point at x,y

plt.show()

# %%
plt.axis([0, 100, 0, 10])
for x in np.arange(1, 100, 1):
    r = x/100
    g = 0
    b = 0
    plt.plot([x, x], [0, 10], linewidth=5, color=(r, g, b))
plt.show()

# %%
