Ext.define('EmergencePullTool.util.Diff', {
    singleton: true,

    getDiff: function(a, b) {
        var calcMiddleSnake = function(a, aIndex, N, b, bIndex, M) {
            var V = {},
                rV = {},
                maxD = Math.ceil((M+N)/2),
                delta = N-M,
                odd = (delta & 1) != 0,
                x, y, xStart, yStart;

            V[1] = 0;
            rV[delta-1] = N;
            for (var D = 0; D <= maxD; D++) {
                for (var k = -D; k<=D; k+=2) {
                    var down = k == -D || k != D && V[k-1] < V[k+1];

                    if (down) {
                        xStart = x = V[k+1];
                        yStart = xStart-(k+1);
                    } else {
                        xStart = x = V[k-1];
                        yStart = xStart-(k-1);
                        x++;
                    }

                    y = x-k;
                    while (x < N && y < M && a[aIndex+x] == b[bIndex+y]) {
                        x++;
                        y++;
                    }
                    V[k] = x;
                    if (odd && k >= delta-(D-1) && k <= delta+(D-1)) {
                        if (rV[k] <= V[k]) {
                            if (down && xStart == 0 && yStart == -1) {
                                yStart++;
                            }
                            return {
                                numDiffs: 2*D-1,
                                x: aIndex+xStart,
                                y: bIndex+yStart,
                                u: aIndex+x,
                                v: bIndex+y,
                                insertion: down,
                                index: down?bIndex+yStart:aIndex+xStart,
                                forward: true
                            };
                        }
                    }
                }
                var dDelta = D+delta,
                    dDeltaNeg = -D+delta;

                for (var k = dDeltaNeg; k<=dDelta; k+=2) {
                    var up = k == dDelta || k != dDeltaNeg && rV[k-1] < rV[k+1];

                    if (up) {
                        xStart = x = rV[k-1];
                        yStart = xStart-(k-1);
                    } else {
                        xStart = x = rV[k+1];
                        yStart = xStart-(k+1);
                        x--;
                    }

                    y = x-k;
                    while (x > 0 && y > 0 && a[aIndex+x-1] == b[bIndex+y-1]) {
                        x--;
                        y--;
                    }
                    rV[k] = x;

                    if (!odd && k >= -D && k <= D) {
                        if (rV[k] <= V[k]) {
                            if (up && xStart == N && yStart == M+1) {
                                yStart--;
                            }
                            return {
                                numDiffs: 2*D,
                                x: aIndex+x,
                                y: bIndex+y,
                                u: aIndex+xStart,
                                v: bIndex+yStart,
                                insertion: up,
                                index: up?bIndex+yStart-1:aIndex+xStart-1,
                                forward: false
                            };
                        }
                    }
                }
            }
            throw 'Didn\'t find middle snake';
        };

        var calcSES = function(a, aIndex, N, b, bIndex, M, ses) {
            if (N == 0 && M == 0) {
                return;
            }

            var middleSnake = calcMiddleSnake(a, aIndex, N, b, bIndex, M);

            if (middleSnake.numDiffs == 1) {
                (middleSnake.insertion?ses.insertions:ses.deletions).push(middleSnake.index);
            } else if (middleSnake.numDiffs > 1) {
                (middleSnake.insertion?ses.insertions:ses.deletions).push(middleSnake.index);
                calcSES(a, aIndex, middleSnake.x - aIndex, b, bIndex, middleSnake.y - bIndex, ses);
                calcSES(a, middleSnake.u, aIndex+N-middleSnake.u, b, middleSnake.v, bIndex+M-middleSnake.v, ses);
            }
        };

        var ses = {
            insertions: [],
            deletions: []
        };

        calcSES(a, 0, a.length, b, 0, b.length, ses);
        ses.insertions.sort(function(a, b) {
            return a-b;
        });
        ses.deletions.sort(function(a, b) {
            return a-b;
        });
        return ses;
    }
});