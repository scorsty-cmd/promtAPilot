import sys, cv2, numpy as np
ims=[cv2.resize(cv2.imread(f"prev_{s}.jpg"),(960,540)) for s in sys.argv[2:]]
for i,s in enumerate(sys.argv[2:]): cv2.putText(ims[i],s,(10,40),0,1.2,(0,255,255),3)
while len(ims)%2: ims.append(np.zeros_like(ims[0]))
rows=[np.hstack(ims[i:i+2]) for i in range(0,len(ims),2)]
cv2.imwrite(sys.argv[1],np.vstack(rows),[cv2.IMWRITE_JPEG_QUALITY,75])
